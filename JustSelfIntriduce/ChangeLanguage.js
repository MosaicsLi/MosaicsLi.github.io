import { App_CardsVue } from "./Cards.js";
const ChangeLanguageVueApp = createApp({
    data() {
        return {
            sharedState,
        };
    },
    mounted() {
        this.getLanguageDataApi();
        this.ChangeLanguageJsonData("./JustSelfIntriduce/Jsons/Language/default.json","./JustSelfIntriduce/Jsons/Cards.json");
    },
    methods: {
        async ChangeLanguageJsonData(JsonPath,CardJsonPath) {
            try {
                const response = await axios.get(JsonPath);
                sharedState.LanguageData = response.data;
                App_CardsVue.getCardDataApi(CardJsonPath) ;
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
        }
    },
});
ChangeLanguageVueApp.component('language-list', {
    props: {
        list: Array,
    },
    template: `
    <div v-for="language in list">
    <li class="nav-item">
        <a class="nav-link"  @click="$emit('language-click',language.JsonPath,language.CardJsonPath)">{{language.LanguageName}}</a>
    </li>
    </div>
    `,

});

ChangeLanguageVueApp.mount('#LanguageChangeable');