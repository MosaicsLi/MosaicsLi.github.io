const AdventurerNameStatusVueApp = createApp({
    data() {
        return {
            sharedState
        };
    },
    mounted() {
        this.getJobDataApi();
    },
    methods: {
        async getJobDataApi() {
            try {
                const response = await axios.get('./Jsons/White Mage.json');
                this.sharedState.AdventurerBaseInfo = response.data;
                console.log(this.sharedState.AdventurerBaseInfo);
                this.sharedState.Adventurerstatus = this.sharedState.AdventurerBaseInfo.AdventurerStatus.find(adventurer => adventurer.AdventurerLevel === 30);
                this.sharedState.MainStatus = this.sharedState.Adventurerstatus.MainStatus;
                this.sharedState.SubStatus = this.sharedState.Adventurerstatus.SubStatus;
                //console.log("jsonData = "+JSON.stringify(this.LimitBreak, null, 2));
            } catch (error) {
                console.error('Error loading JSON data:', error);
            }
        },
        HI(){
            alert("HI");
        }
    },

});
AdventurerNameStatusVueApp.mount('#Character-Information');