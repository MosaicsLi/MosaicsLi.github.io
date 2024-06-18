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
        async greet(JsonPath) {
            try {
                const response = await axios.get(JsonPath);
                JobJson = response.data;
                console.log("JobJson:");
                console.log(JobJson);


                console.log(sharedState.AdventurerBaseInfo );
                sharedState.AdventurerBaseInfo = JobJson;
                sharedState.Adventurerstatus = sharedState.AdventurerBaseInfo.AdventurerStatus.find(adventurer => adventurer.AdventurerLevel === 30);
                sharedState.MainStatus = sharedState.Adventurerstatus.MainStatus;
                sharedState.SubStatus = sharedState.Adventurerstatus.SubStatus;
                //console.log("jsonData = "+JSON.stringify(this.LimitBreak, null, 2));
            } catch (error) {
                console.error('Error loading JSON data:', error);
            }
        },
    },

});

JobChange.component('job-list', {
    props: {
        list: Array,  // 接收包含不同 action 資訊的陣列
    },
    template: `
    <div v-for="job in list" :key="job.JobName">
    <button  @click="$emit('someEvent',[job.JsonPath])">
        <img :src="[job.JobIcon]"   />
        </button>
    </div>
    `,

});
JobChange.mount('#JobList');