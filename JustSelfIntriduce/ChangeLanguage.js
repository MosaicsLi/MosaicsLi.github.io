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
                this.getCardDataApi(CardJsonPath) ;
            } catch (error) {
                console.error('Error loading Language JSON data:', error);
            }
        },
        async getCardDataApi(JsonPath) {
            try {
                const response = await axios.get(JsonPath);
                sharedState.Cards = response.data;
                console.log("Cards data load")
            } catch (error) {
                console.error('Error loading Cards JSON data:', error);
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