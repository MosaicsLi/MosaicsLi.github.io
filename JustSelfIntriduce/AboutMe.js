const AboutMeVueApp = createApp({
    data() {
        return {
            sharedState,
            url:null
        };
    },
    methods:{
        onFileChange(e) {
            const file = e.target.files[0];
            this.url = URL.createObjectURL(file);
          }
    }
});
AboutMeVueApp.mount('#AboutMe');