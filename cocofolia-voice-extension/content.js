(function () {
    console.log("✅ Cocofolia Voice Extension loaded");

    const observer = new MutationObserver(() => {
        const inputBox = document.querySelector('textarea[placeholder*="メッセージ"], textarea');
        if (inputBox && !inputBox.dataset.voiceBound) {
            inputBox.dataset.voiceBound = "true";
            inputBox.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    const text = inputBox.value.trim();
                    if (text.startsWith("/voice ")) {
                        //e.preventDefault();
                        const message = text.replace("/voice ", "");
                        console.log("🎤 Voice command:", message);

                        chrome.runtime.sendMessage({ action: "speak", text: message }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error("🚨 Runtime error:", chrome.runtime.lastError.message);
                                return;
                            }

                            if (response?.success && response.audioBase64) {
                                // ✅ 將 base64 轉成 Blob URL 再播放
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
            console.log("🎧 Voice command listener attached!");
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
