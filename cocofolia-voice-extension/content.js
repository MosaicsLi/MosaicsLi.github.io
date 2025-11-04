// 這是一個 IIFE（立即執行函式），載入時會立刻執行整個區塊
(function () {

    // 🔹 載入擴充功能時在 console 顯示提示訊息
    console.log("✅ Cocofolia Room Chat Voice Reader loaded");

    // 已處理過的訊息集合，用來防止重複播放
    const processed = new Set();

    // 🔍 找聊天室訊息清單（ul）
    function getChatList() {
        return document.querySelector("ul.MuiList-root");
    }
    let lastPlay = 0;
    // ✅ 播放固定提示音
    function playNotificationSound() {
        try {
            const now = Date.now();
            if (now - lastPlay < 1000) return; // 1 秒內不重複播放
            lastPlay = now;
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";        // 正弦波
            osc.frequency.value = 880; // 聲音頻率（Hz）→ 越高越尖銳
            gain.gain.value = 0.1;    // 音量（0.0～1.0）

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            console.log("💬 播放新訊息提示音");

            // 持續 200ms 後停止
            setTimeout(() => {
                osc.stop();
                ctx.close();
            }, 200);
        } catch (err) {
            console.error("🔇 播放提示音失敗:", err);
        }
    }
    // 🔄 建立 MutationObserver 偵測新訊息出現
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;

                // 每個訊息節點中，文字都放在 <p class="MuiTypography-body2"> 裡
                const messageElement = node.querySelector("p.MuiTypography-body2");
                if (!messageElement) continue;

                const text = messageElement.innerText.trim();
                if (!text || processed.has(text)) continue;

                processed.add(text);
                console.log("💬 新訊息偵測:", text);
                // ✅ 無論內容是什麼，一律播放提示音
                playNotificationSound();

                if (!text.startsWith("voice ")) {
                    continue;
                }
                const message = text.replace("voice ", "");
                console.log("💬 新語音偵測:", message);

                // 傳給 background 進行語音合成
                chrome.runtime.sendMessage({ action: "speak", text: message }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("🚨 Runtime error:", chrome.runtime.lastError.message);
                        return;
                    }

                    if (response?.success && response.audioBase64) {
                        const binary = atob(response.audioBase64);
                        const bytes = new Uint8Array(binary.length);
                        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                        const blob = new Blob([bytes], { type: "audio/wav" });
                        const audioURL = URL.createObjectURL(blob);
                        new Audio(audioURL).play();
                        console.log("🎵 再生中:", message);
                    } else {
                        console.error("❌ Voice synthesis failed:", response?.error);
                    }
                });
            }
        }
    });

    // 👀 等待聊天室載入完成後再綁定觀察器
    const waitForChat = setInterval(() => {
        const chatList = getChatList();
        if (chatList) {
            clearInterval(waitForChat);
            observer.observe(chatList, { childList: true, subtree: true });
            console.log("🎧 Chat observer attached to:", chatList);
        }
    }, 1000);
})();
