let proxyIP = null; // 全域變數保存目前 Proxy URL

// 初始化時讀取一次
chrome.storage.sync.get(["proxyIP"], (data) => {
  proxyIP = data.proxyIP || "https://talismanic-unreprimanding-jaleesa.ngrok-free.dev"; // VOICEVOX 伺服器
  console.log("🌐 Proxy IP 設定初期化:", proxyIP);
});

// 🔄 偵測儲存變更（例如 popup 儲存時）
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.proxyIP) {
    proxyIP = changes.proxyIP.newValue;
    console.log("🔄 Proxy IP 已更新:", proxyIP);
  }
});
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "speak") {
        (async () => {
            const speaker = 1;
            const text = msg.text;

            try {
                // Step 1: audio_query
                const queryResponse = await fetch(`${proxyIP}/api/audio_query`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, speaker })
                });

                if (!queryResponse.ok) throw new Error("audio_query failed");
                const queryData = await queryResponse.json();

                // Step 2: synthesis
                const synthesisResponse = await fetch(`${proxyIP}/api/synthesis`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ speaker, queryData })
                });

                if (!synthesisResponse.ok) throw new Error("synthesis failed");
                // ⚠️ Blob 轉成 base64（因 Service Worker 無法用 URL.createObjectURL）
                const arrayBuffer = await synthesisResponse.arrayBuffer();
                const base64 = btoa(
                    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
                );

                sendResponse({ success: true, audioBase64: base64 });
            } catch (err) {
                console.error("❌ Voice synthesis error:", err);
                sendResponse({ success: false, error: err.message });
            }
        })();

        // 🔸 一定要 return true 保持訊息通道開著
        return true;
    }
});
