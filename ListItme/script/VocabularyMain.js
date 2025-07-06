import { Mount_CardsVue } from "./VocabularyCard.js";
const Main = createApp({
    data() {
        return {
            sharedState
        }
    },
    template: `
        <nav class="navbar navbar-expand-sm bg-dark navbar-dark">
            <label class="ImportJson">
                <input type="file" style="display:none;" @change="handleFileUpload" accept=".json">
                <span>インポート➕</span>
            </label>
            <button @click="saveJSON">エクスポート</button>
        </nav>
    `,
    mounted() {
        console.log("Main mounted");
        this.ChangeCardData('./json/Vocabulary.json');
    },
    methods: {
        async ChangeCardData(CardJsonPath) {
            try {
                Mount_CardsVue.getCardDataApi(CardJsonPath);
            } catch (error) {
                console.error('Error loading Card JSON data:\r\nCardJsonPath:' + CardJsonPath, error);
            }
        },
        Hello() {
            console.log("sharedState.CardsList:");
            console.log(sharedState.CardsList);
            return "Hello !";
        },
        saveJSON() {
            // 將 JSON 物件轉換為字串
            var jsonString = JSON.stringify(sharedState.CardsList, null, 2);

            // 建立一個新的 Blob 物件，用於存儲 JSON 字串
            var blob = new Blob([jsonString], { type: "application/json" });

            // 建立一個 URL 來表示 Blob 對象
            var url = URL.createObjectURL(blob);

            // 創建一個 <a> 元素來進行下載
            var a = document.createElement("a");
            a.href = url;
            a.download = "data.json"; // 下載檔案的名稱

            // 將 <a> 元素添加到文檔中，並模擬點擊來啟動下載
            document.body.appendChild(a);
            a.click();

            // 清理
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file && file.type === "application/json") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        sharedState.CardsList = JSON.parse(e.target.result);
                        //Object.assign(sharedState,JSON.parse(e.target.result));
                    } catch (error) {
                        alert("Error parsing JSON: " + error.message);
                    }
                };
                reader.readAsText(file);
            } else {
                alert("Please upload a valid JSON file.");
            }
        }
    }
});
const vMountedInstance = Main.mount('#app');