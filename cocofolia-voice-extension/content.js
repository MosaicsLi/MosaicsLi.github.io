// 這是一個 IIFE（立即執行函式），載入時會立刻執行整個區塊
(function () {
    console.log("✅ Cocofolia Room Chat Voice Reader (Main tab only) loaded");


    // 已處理過的訊息集合，用來防止重複播放
    const processed = new Set();
    let observer = null; // 儲存 MutationObserver 實例
    let activeTab = "";  // 當前選中的 tab 名稱

    // 🔍 找聊天室列表與 tab 容器
    function getChatList() {
        return document.querySelector("ul.MuiList-root");
    }

    function getActiveTabName() {
        const selectedTab = document.querySelector('[role="tab"][aria-selected="true"]');
        return selectedTab?.id?.trim().toLowerCase() || "";
    }

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
            console.log("📢 播放新訊息提示音");

            // 持續 200ms 後停止
            setTimeout(() => {
                osc.stop();
                ctx.close();
            }, 200);
        } catch (err) {
            console.error("🔇 播放提示音失敗:", err);
        }
    }
    // 🔊 處理新訊息
    function handleMessage(messageElement) {
        const text = messageElement.innerText.trim();
        if (!text || processed.has(text)) return;
        processed.add(text);
        console.log("💬 新訊息偵測:", text);

        if (!text.startsWith("voice ")) {
            return;
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
    // 👂 啟動聊天室監聽
    function startObservingChat() {
        if (observer) return; // 已啟動就不重複

        const chatList = getChatList();
        if (!chatList) return;
        
        // 🧹 啟動時先把現有訊息全部加入 processed，避免舊訊息被處理
        const existingMessages = chatList.querySelectorAll("p.MuiTypography-body2");
        existingMessages.forEach((msg) => {
            const text = msg.innerText.trim();
            if (text) processed.add(text);
        });
        console.log(`🧩 已忽略 ${existingMessages.length} 條啟動前訊息`);

        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;

                    // 每個訊息節點中，文字都放在 <p class="MuiTypography-body2"> 裡
                    const messageElement = node.querySelector("p.MuiTypography-body2");
                    if (messageElement) handleMessage(messageElement);
                    // ✅ 無論內容是什麼，一律播放提示音
                    playNotificationSound();
                }
            }
        });

        observer.observe(chatList, { childList: true, subtree: true });
        console.log("🎧 Chat observer started (main tab)");
    }

    // 📴 停止監聽
    function stopObservingChat() {
        if (observer) {
            observer.disconnect();
            observer = null;
            console.log("🛑 Chat observer stopped (not in main tab)");
        }
    }

    // 🔄 監控 tab 切換
    const tabObserver = new MutationObserver(() => {
        const newTab = getActiveTabName();
        if (newTab !== activeTab) {
            activeTab = newTab;
            console.log("🔁 Tab changed:", activeTab);

            if (activeTab === "main") {
                startObservingChat();
            } else {
                stopObservingChat();
            }
        }
    });

    // 🕓 等待 tab 載入後再開始監控
    const waitForTabs = setInterval(() => {
        const tabs = document.querySelector('[role="tablist"]');
        if (tabs) {
            clearInterval(waitForTabs);
            tabObserver.observe(tabs, { childList: true, subtree: true, attributes: true });
            activeTab = getActiveTabName();
            console.log("👀 Now watching tab changes. Current tab:", activeTab);

            // 若進入頁面時 tab 已是 main，立即啟動
            if (activeTab === "main") startObservingChat();
        }
    }, 500);
})();
