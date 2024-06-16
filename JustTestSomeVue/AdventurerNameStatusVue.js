const AdventurerNameStatusVueApp = createApp({
    data() {
        return {
            Adventurerstatus: {},
            AdventurerBaseInfo: {},
            // 定義其他類型的 action 資料陣列
        };
    },
    mounted() {
        this.getJobDataApi();
    },
    methods: {
        async getJobDataApi() {
            try {
                const response = await axios.get('./Jsons/White Mage.json');
                this.AdventurerBaseInfo = response.data;
                this.Adventurerstatus=response.data.AdventurerStatus.find(adventurer => adventurer.AdventurerLevel === 30);;
                console.log(this.Adventurerstatus);
                //console.log("jsonData = "+JSON.stringify(this.LimitBreak, null, 2));
            } catch (error) {
                console.error('Error loading JSON data:', error);
            }
        },
    },

});
AdventurerNameStatusVueApp.mount('#Character-stats');