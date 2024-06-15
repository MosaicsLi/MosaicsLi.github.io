
// main.js
const { createApp, ref } = Vue;

const vm = createApp({
    data() {
        return {
            actionobject: {},
        };
    },
    setup() {
        const message = ref('Hello Vue 3.0!');
        return {
            message
        }
    },
    mounted() {
        this.getJobDataApi();
    },
    methods: {
        async getJobDataApi() {
            try {
                const response = await axios.get('./Jsons/White Mage.json');
                this.actionobject = response.data.InstantAction;
                //console.log("jsonData = "+JSON.stringify(this.LimitBreak, null, 2));
            } catch (error) {
                console.error('Error loading JSON data:', error);
            }
        },
    },
});
// mount
vm.mount('#container');
