// 立即執行函式（IIFE）
// → 腳本載入後立刻執行整段邏輯
(function () {
    console.log("✅ Cocofolia Room Chat Voice Reader (Main tab only) loaded");

    /** 
     * ✅ 主要邏輯說明：
     * - 啟動時：只標記現有訊息為「已看過」，不朗讀。
     * - 啟動後：任何新增訊息節點（即使文字重複），只要以 "voice " 開頭就會朗讀。
     * - 僅在「main」分頁被選中時才運作。
     */

    // ======================================================
    // 🧠 全域狀態
    // ======================================================
    // 用 WeakSet 記錄已看過的訊息 DOM 節點（以 DOM 節點為單位，而非文字內容）
    const seen = new WeakSet();

    // 用於儲存監聽器實例與目前啟用分頁狀態
    let observer = null;
    // 儲存啟動時的時間，用於過濾啟動前的訊息
    let initTimestamp = new Date();
    let activeTab = "";

    // 防止提示音過於頻繁播放（同 1 秒內忽略）
    let lastPlay = 0;
    // ======================================================
    // 🔍 工具函式區
    // ======================================================

    /** 🔍 取得聊天室訊息清單容器（通常是 ul.MuiList-root） */
    function getChatList() {
        return document.querySelector("ul.MuiList-root");
    }

    /** 🔍 取得目前選中的分頁名稱（通常為 main / log / ...） */
    function getActiveTabName() {
        const selectedTab = document.querySelector('[role="tab"][aria-selected="true"]');
        return selectedTab?.id?.trim().toLowerCase() || "";
    }
    // 取得時間文字（例如「- 先週 日曜日 1:05」）
    function getMessageTimestamp(messageNode) {
        if (!messageNode) return null;
        const span = messageNode.querySelector("span.MuiTypography-caption");
        if (!span) return null;
        return span.innerText.trim().replace(/\s+/g, " ");
    }

    // 將 Cocofolia 的時間字串轉成 Date 物件
    function parseTimestamp(text) {
        if (!text) return null;
        const now = new Date();
        const base = new Date(now);
        let hour = 0, minute = 0;

        // 解析時間數字
        const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            hour = parseInt(timeMatch[1], 10);
            minute = parseInt(timeMatch[2], 10);
        }

        // 判斷日期詞
        if (text.includes("昨日") || text.toLowerCase().includes("yesterday")) {
            base.setDate(now.getDate() - 1);
        } else if (text.includes("先週") || text.toLowerCase().includes("last week")) {
            base.setDate(now.getDate() - 7);
        } else {
            const weekdays = [
                ["日", "Sun"],
                ["月", "Mon"],
                ["火", "Tue"],
                ["水", "Wed"],
                ["木", "Thu"],
                ["金", "Fri"],
                ["土", "Sat"],
            ];
            for (let i = 0; i < weekdays.length; i++) {
                const [jp, en] = weekdays[i];
                if (text.includes(jp) || text.toLowerCase().includes(en.toLowerCase())) {
                    const diff = (now.getDay() - i + 7) % 7;
                    base.setDate(now.getDate() - diff);
                    break;
                }
            }
        }

        base.setHours(hour, minute, 0, 0);
        return base;
    }

    /** 🔊 播放固定提示音（避免頻繁播放） */
    function playNotificationSound() {
        const now = Date.now();
        if (now - lastPlay < 1000) return; // 1 秒內不重複
        lastPlay = now;

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";          // 正弦波
            osc.frequency.value = 880;  // 聲音頻率（Hz）
            gain.gain.value = 0.1;      // 音量

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();

            // 播放 200ms 後停止
            setTimeout(() => {
                osc.stop();
                ctx.close();
            }, 200);
        } catch (err) {
            console.error("🔇 播放提示音失敗:", err);
        }
    }

    // ======================================================
    // 🎙️ 處理訊息（核心）
    // ======================================================

    /** 🎙️ 處理每一則新訊息（僅針對尚未處理的 DOM 節點） */
    function handleMessage(messageElement) {
        // 避免重複處理相同 DOM 節點
        if (seen.has(messageElement)) return;
        seen.add(messageElement);

        const text = messageElement.innerText?.trim();
        if (!text) return;


        // ✅ 通過兩層過濾 → 播放
        console.log("🗣️ 新語音訊息偵測:", text);
        // 播放提示音
        playNotificationSound();

        // 僅針對以「voice 」開頭的訊息
        if (!text.startsWith("voice ")) return;


        // 移除前綴 "voice "，取得要朗讀的內容
        const message = text.replace(/^voice\s+/, "");
        console.log("🎤 準備朗讀訊息:", message);

        // 將文字交給 background 進行語音合成
        chrome.runtime.sendMessage({ action: "speak", text: message }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("🚨 Runtime error:", chrome.runtime.lastError.message);
                return;
            }

            // 成功時播放語音
            if (response?.success && response.audioBase64) {
                const binary = atob(response.audioBase64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                const blob = new Blob([bytes], { type: "audio/wav" });
                const audioURL = URL.createObjectURL(blob);
                new Audio(audioURL).play();
                console.log("🎵 語音播放中:", message);
            } else {
                console.error("❌ 語音合成失敗:", response?.error);
            }
        });
    }

    /** 👂 啟動聊天室監聽器（僅在 main 分頁） */
    function startObservingChat() {
        if (observer) return; // 已啟動就略過

        const chatList = getChatList();
        if (!chatList) return;

        // 先標記啟動前已存在的訊息，避免初始時唸出舊內容
        const existingMessages = chatList.querySelectorAll("p.MuiTypography-body2");
        existingMessages.forEach((el) => seen.add(el));
        console.log(`🧩 啟動時已標記 ${existingMessages.length} 則現有訊息為已看過`);
        console.log("🕒 設定啟動基準時間 =", initTimestamp);

        // 啟動 MutationObserver 監聽新訊息加入
        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue; // 只處理元素節點

                    // node 可能是 <p> 本身，或是外層容器
                    const messageElement =
                        node.matches?.("p.MuiTypography-body2")
                            ? node
                            : node.querySelector?.("p.MuiTypography-body2");


                    const timestampText = getMessageTimestamp(node);
                    const timestamp = parseTimestamp(timestampText);

                    // 若時間早於啟動時間 → 視為舊訊息
                    if (initTimestamp && timestamp && timestamp <= initTimestamp) {
                        console.log("⏳ 跳過舊訊息:", messageElement.innerText?.trim(), "| 時間:", timestampText);
                        continue;
                    }
                    if (messageElement) handleMessage(messageElement);
                }
            }
        });

        observer.observe(chatList, { childList: true, subtree: true });
        console.log("🎧 Chat observer started (main tab)");
    }

    /** 📴 停止監聽（切離非 main 分頁時） */
    function stopObservingChat() {
        if (observer) {
            observer.disconnect();
            observer = null;
            console.log("🛑 Chat observer stopped (not in main tab)");
        }
    }

    /** 🔄 監控分頁切換狀態，確保僅在 main 分頁時啟動監聽 */
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

    /** 🕓 初始化：等待 tablist 載入後才開始監控 */
    const waitForTabs = setInterval(() => {
        const tabs = document.querySelector('[role="tablist"]');
        if (tabs) {
            clearInterval(waitForTabs);
            tabObserver.observe(tabs, {
                childList: true,
                subtree: true,
                attributes: true,
            });

            activeTab = getActiveTabName();
            console.log("👀 Now watching tab changes. Current tab:", activeTab);

            // 若載入時已位於 main 分頁，立即啟動監聽
            if (activeTab === "main") startObservingChat();
        }
    }, 500);
})();
