// 這是一個 IIFE（立即執行函式），載入時會立刻執行整個區塊
(function () {

    // 🔹 1️⃣ 載入擴充功能時在 console 顯示提示訊息
    console.log("✅ Cocofolia Voice Extension loaded");

    // 🔹 2️⃣ 建立一個 MutationObserver，用來偵測 DOM 變化（例如聊天室框動態生成）
    const observer = new MutationObserver(() => {

        // 嘗試尋找聊天室的輸入框（Cocofolia 的訊息輸入框 placeholder 含有「メッセージ」字樣）
        const inputBox = document.querySelector('textarea[placeholder*="メッセージ"], textarea');

        // 如果找到輸入框，且還沒有綁定事件（用 dataset.voiceBound 避免重複綁定）
        if (inputBox && !inputBox.dataset.voiceBound) {

            // 標記為已綁定事件，防止重複觸發
            inputBox.dataset.voiceBound = "true";

            // 🔹 3️⃣ 在輸入框上監聽「keydown」事件（鍵盤按下時）
            inputBox.addEventListener("keydown", (e) => {

                // 檢查是否按下 Enter 鍵
                if (e.key === "Enter") {

                    // 取得輸入的文字並去除前後空白
                    const text = inputBox.value.trim();

                    // 若使用者輸入的是以 /voice 開頭的指令
                    if (text.startsWith("/voice ")) {

                        // （可選）若要阻止訊息真的送出，可取消註解這行
                        // e.preventDefault();

                        // 去掉「/voice 」前綴，只留下要說的文字
                        const message = text.replace("/voice ", "");

                        console.log("🎤 Voice command:", message);

                        // 🔹 4️⃣ 向 background script 傳送訊息，要求合成語音
                        chrome.runtime.sendMessage(
                            { action: "speak", text: message },
                            (response) => {

                                // 如果傳送或回應過程出錯（例如 background 沒回覆）
                                if (chrome.runtime.lastError) {
                                    console.error("🚨 Runtime error:", chrome.runtime.lastError.message);
                                    return;
                                }

                                // 🔹 5️⃣ 若背景回傳成功並帶有音訊資料（Base64 格式）
                                if (response?.success && response.audioBase64) {

                                    // ✅ 將 base64 字串轉成二進位資料
                                    const binary = atob(response.audioBase64);
                                    const bytes = new Uint8Array(binary.length);
                                    for (let i = 0; i < binary.length; i++) {
                                        bytes[i] = binary.charCodeAt(i);
                                    }

                                    // 將 Uint8Array 轉成 Blob（音訊檔）
                                    const blob = new Blob([bytes], { type: "audio/wav" });

                                    // 建立可以播放的 URL
                                    const audioURL = URL.createObjectURL(blob);

                                    // 使用 Audio API 播放音檔
                                    new Audio(audioURL).play();

                                    console.log("🎵 再生中:", message);
                                } else {
                                    // 若語音合成失敗或沒有音訊資料
                                    console.error("❌ Voice synthesis failed:", response?.error);
                                }
                            }
                        );
                    }
                }
            });

            // 顯示訊息：輸入框監聽器已經附加成功
            console.log("🎧 Voice command listener attached!");
        }
    });

    // 🔹 6️⃣ 開始觀察整個 document.body，偵測子節點新增（聊天室可能是動態生成的）
    observer.observe(document.body, { childList: true, subtree: true });

})(); // <-- 立即執行
