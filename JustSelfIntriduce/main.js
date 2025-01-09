import { Mount_ChangeLanguageVue } from "./ChangeLanguage.js";
import { Mount_AboutMeVue } from "./AboutMe.js";
const Main = createApp({
    data() {
        return {
            sharedState
        }
    }, mounted() {
        console.log("Main mounted")
    },
    methods:{
        HI() {
            alert("HI");
          }
    }
});
const vMountedInstance = Main.mount('#app');
