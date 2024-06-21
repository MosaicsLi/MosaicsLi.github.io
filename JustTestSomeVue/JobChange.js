const JobChange = createApp({
    data() {
        return {
            JobList: [],
            // 定義其他類型的 action 資料陣列
        };
    },
    mounted() {
        this.getJobListApi();
    },
    methods: {
        async getJobListApi() {
            try {
                const response = await axios.get('./Jsons/JobList.json');
                this.JobList = response.data;
                console.log("JobList:");
                console.log(this.JobList);
                //console.log("jsonData = "+JSON.stringify(this.LimitBreak, null, 2));
            } catch (error) {
                console.error('Error loading JSON data:', error);
            }
        },
        async ChangeJobJsonData(JsonPath) {
            try {
                const response = await axios.get(JsonPath);
                sharedState.AdventurerBaseInfo = response.data;
                sharedState.Adventurerstatus = sharedState.AdventurerBaseInfo.AdventurerStatus.find(adventurer => adventurer.AdventurerLevel === 30);

                console.log(sharedState)
                console.log("sharedState.Adventurerstatus")
                console.log(sharedState.Adventurerstatus.MainStatus.STR)
                //console.log("jsonData = "+JSON.stringify(this.LimitBreak, null, 2));
            } catch (error) {
                console.error('Error loading JSON data:', error);
            }
        },
        saveJSON() {
            // 將 JSON 物件轉換為字串
            var jsonString = JSON.stringify(sharedState.AdventurerBaseInfo, null, 2);

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
        }

    },

});

JobChange.component('job-list', {
    props: {
        list: Array,  // 接收包含不同 action 資訊的陣列
    },
    template: `
    <div v-for="job in list" :key="job.JobName">
    <button  @click="$emit('jobicon-click',[job.JsonPath])">
        <img :src="[job.JobIcon]"   />
        </button>
    </div>
    `,

});
JobChange.mount('#JobList');