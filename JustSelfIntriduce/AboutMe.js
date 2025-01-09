const AboutMeVueApp = createApp({
    data() {
        return {
            sharedState,
            url:null
        };
    },
    mounted(){
        
        console.log("AboutMeVueApp mounted");
    },
    methods:{
        onFileChange(e) {
            const file = e.target.files[0];
            this.url = URL.createObjectURL(file);
          }
    }
});

const Mount_AboutMeVue = AboutMeVueApp.mount('#AboutMe');
export { Mount_AboutMeVue };