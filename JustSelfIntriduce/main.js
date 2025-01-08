
const vm = createApp({
    data() {
        return {
            name: '008JS'
        }
    }, mounted() {
        console.log("HI")
    },
    methods:{
        HI() {
            alert("HI");
          }
    }
});
const vMountedInstance = vm.mount('#app');
vMountedInstance.$data.IAM = '30acm';
console.log(vMountedInstance.$data.IAM)