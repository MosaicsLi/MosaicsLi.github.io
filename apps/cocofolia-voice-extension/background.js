// ==========================
// 🎤 VOICEVOX 語音合成功能背景程式（background.js）
// ==========================

// 用來保存目前使用的 VOICEVOX Proxy Server 位址（API URL）
let proxyIP = null;

// --------------------------
// 🚀 初始化：讀取儲存在 chrome.storage.sync 裡的 proxyIP
// --------------------------
chrome.storage.sync.get(["proxyIP"], (data) => {
  // 若無資料則使用預設 ngrok 伺服器 URL
  proxyIP = data.proxyIP || "https://talismanic-unreprimanding-jaleesa.ngrok-free.dev";
  console.log("🌐 Proxy IP 設定初期化:", proxyIP);
});

// --------------------------
// 🔄 監聽儲存變更事件：當 popup.js 或其他地方修改了 proxyIP 時即時更新
// --------------------------
chrome.storage.onChanged.addListener((changes, namespace) => {
  // 只關心 sync 區域內的 proxyIP 變更
  if (namespace === "sync" && changes.proxyIP) {
    proxyIP = changes.proxyIP.newValue;
    console.log("🔄 Proxy IP 已更新:", proxyIP);
  }
});

// --------------------------
// 📩 接收來自 content script 或 popup 的訊息
// --------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // 若訊息 action 是 "speak"，代表要執行語音合成
  if (msg.action === "speak") {
    (async () => {
      const speaker = 1; // 指定 VOICEVOX 語音角色 ID（1 = 四国めたん）
      const text = msg.text; // 要唸出的文字內容

      try {
        // ==========================
        // Step 1️⃣：向 VOICEVOX 要求語音查詢 (audio_query)
        // ==========================
        const queryResponse = await fetch(`${proxyIP}/api/audio_query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speaker })
        });

        if (!queryResponse.ok) throw new Error("audio_query failed");
        const queryData = await queryResponse.json(); // VOICEVOX 回傳音訊參數設定（音高、速度等）

        // ==========================
        // Step 2️⃣：向 VOICEVOX 要求語音合成 (synthesis)
        // ==========================
        const synthesisResponse = await fetch(`${proxyIP}/api/synthesis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ speaker, queryData }) // 把剛剛拿到的設定送回去合成音訊
        });

        if (!synthesisResponse.ok) throw new Error("synthesis failed");

        // ==========================
        // Step 3️⃣：把回傳的音訊資料（ArrayBuffer）轉成 base64
        // ==========================
        // ❗ 為什麼用 base64？
        // 因為 background.js 是在 Service Worker 環境，
        // 無法使用 URL.createObjectURL() 建立音訊檔的 blob URL。
        const arrayBuffer = await synthesisResponse.arrayBuffer();

        // 將二進位資料逐 byte 轉成字串後再轉成 base64
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        // 成功後把結果傳回前端（例如 content script），讓它播放音訊
        sendResponse({ success: true, audioBase64: base64 });

      } catch (err) {
        // 若任何步驟出錯，回傳錯誤訊息
        console.error("❌ Voice synthesis error:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    // ⚠️ 必須 return true：讓 Chrome 保持訊息通道開著直到 async 結束
    return true;
  }
});
