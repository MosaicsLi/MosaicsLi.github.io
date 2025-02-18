import { Mount_CardsVue } from "./Cards.js";
const ChangeLanguageVueApp = createApp({
    data() {
        return {
            sharedState,
        };
    },
    mounted() {
        console.log("ChangeLanguageVueApp mounted");
        this.getLanguageDataApi();
        this.ChangeLanguageJsonData("./JustSelfIntriduce/Jsons/Language/default.json","./JustSelfIntriduce/Jsons/Cards.json");
    },
    methods: {
        async ChangeLanguageJsonData(JsonPath,CardJsonPath) {
            try {
                const response = await axios.get(JsonPath);
                sharedState.LanguageData = response.data;
                console.log("Language data load")
                Mount_CardsVue.getCardDataApi(CardJsonPath) ;
            } catch (error) {
                console.error('Error loading Language JSON data:', error);
            }
        },
        async getLanguageDataApi() {
            try {
                const response = await axios.get('./JustSelfIntriduce/Jsons/Language/Languages.json');
                sharedState.AvailableLanguage=response.data;
                console.log("Available Language data load")
            } catch (error) {
                console.error('Error loading Available Language JSON data:', error);
            }
        },
        HI(){
            alert("HI");
        }

    },
});
ChangeLanguageVueApp.component('language-list', {
    props: {
        list: Array,
        parentfunction:Function,
    },
    template: `
    <div v-for="language in list">
    <li class="nav-item">
        <a class="nav-link"  @click="parentfunction(language.JsonPath,language.CardJsonPath)">{{language.LanguageName}}</a>
    </li>
    </div>
    `,
//<a class="nav-link"  @click="$emit('language-click',language.JsonPath,language.CardJsonPath)">{{language.LanguageName}}</a>
});

const Mount_ChangeLanguageVue=ChangeLanguageVueApp.mount('#LanguageChangeable');
export { Mount_ChangeLanguageVue };