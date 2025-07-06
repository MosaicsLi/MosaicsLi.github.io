const CardsVueApp = createApp({
    data() {
        return {
            sharedState,
            Cards:[]
        };
    },
    mounted() {
        console.log("CardsVueApp mounted");
        //this.getCardDataApi('./JustSelfIntriduce/Jsons/Cards.json');
    },
    methods: {
        async getCardDataApi(JsonPath) {
            try {
                const response = await axios.get(JsonPath);
                this.Cards = response.data;
                console.log("Cards data load")
            } catch (error) {
                console.error('Error loading Cards JSON data:', error);
            }
        },
    },
});
CardsVueApp.component('cardlist', {
    props: {
        cardlistarray:Array,
    },
    template: `
    <div class="cards">
        <card :card="cardobject" v-for="cardobject in cardlistarray"></card>
    </div>
    `,
});
CardsVueApp.component('card', {
    props: {
        card: Object,  // 接收包含不同 action 資訊的陣列
    },
    template: `
    <div class="card">
        <a class="nav-link" :href="card.CardHref">
            <div class="card-content text-white">
                <h2 class="mt-5">{{card.Title}}</h2>
                <p>{{card.Introduction}}</p>
                <p v-if=card.Link.length>I steal from those web site :</p>
                <a :href="Link" v-for="Link in card.Link">{{Link}}</a>
            </div>
        </a>
    </div>
    `,
});
const Mount_CardsVue=CardsVueApp.mount('#cardsbutvue');
export { Mount_CardsVue };