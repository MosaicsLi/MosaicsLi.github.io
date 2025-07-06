const CardsVueApp = createApp({
    data() {
        return {
            sharedState
        };
    },
    mounted() {
        console.log("CardsVueApp mounted");
    },
    methods: {
        async getCardDataApi(JsonPath) {
            try {
                const response = await axios.get(JsonPath);
                sharedState.CardsList = response.data;
                console.log("Cards data load")
            } catch (error) {
                console.error('Error loading Cards JSON data:', error);
            }
        },
    },
});
CardsVueApp.component('cardlist', {
    props: {
        cardlistarray: Array,
    },
    data() {
        return {
            editMode: false, // 控制編輯模式的顯示和隱藏
            showAddCardClick: false // 用于控制 add-action 组件的显示和隐藏
        }
    }, methods: {
        handleAddCard(newCard) {
            sharedState.CardsList.push(newCard);
            this.showAddCardClick = false; // 隐藏新增动作组件
        },
        toggleEditMode() {
            this.editMode = !this.editMode;
        },
        deleteAction(card) {
            const index = sharedState.CardsList.indexOf(card);
            if (index > -1) {
                sharedState.CardsList.splice(index, 1);
            }
        },
    },
    template: `
    <div class="cards">
        <card :card="cardobject" v-for="cardobject in cardlistarray"></card>
        <div   @click="showAddCardClick = !showAddCardClick"
                    class="add-cards-button"
                  >
                    + ニューアクション
                </div>
        <add-card v-if="showAddCardClick" @add-card="handleAddCard"></add-card>
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
CardsVueApp.component('add-card', {
    data() {
        return {
            newCard: {
                Title: '',
                CardHref: '',
                Introduction: '',
                Link: []
            },
            linkInput: '' // 輔助輸入 Link 用
        }
    },
    methods: {
        submitNewAction() {
            // 深拷貝 newCard，避免後續資料連動
            const cardToEmit = { ...this.newCard };
            cardToEmit.Link = this.newCard.Link.slice(); // 深拷貝 Link 陣列
            this.$emit('add-card', cardToEmit);
            this.resetNewCard();
        },
        addLink() {
            if (this.linkInput.trim()) {
                this.newCard.Link.push(this.linkInput.trim());
                this.linkInput = '';
            }
        },
        removeLink(index) {
            this.newCard.Link.splice(index, 1);
        },
        resetNewCard() {
            this.newCard = {
                Title: '',
                CardHref: '',
                Introduction: '',
                Link: []
            };
            this.linkInput = '';
        }
    },
    template: `
    <div class="card">
            <div class="card-content text-white">
        <h5>新規カードを追加</h5>
        <div class="mb-2">
            <label>タイトル:</label>
            <input v-model="newCard.Title" class="form-control" />
        </div>
        <div class="mb-2">
            <label>リンク先 (CardHref):</label>
            <input v-model="newCard.CardHref" class="form-control" />
        </div>
        <div class="mb-2">
            <label>紹介文:</label>
            <textarea v-model="newCard.Introduction" class="form-control"></textarea>
        </div>
        <div class="mb-2">
            <label>参照リンク:</label>
            <div class="input-group mb-2">
                <input v-model="linkInput" class="form-control" placeholder="http://example.com" />
                <button @click="addLink" class="btn btn-outline-secondary">追加</button>
            </div>
            <ul class="list-group">
                <li v-for="(link, index) in newCard.Link" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                    {{ link }}
                    <button @click="removeLink(index)" class="btn btn-sm btn-danger">削除</button>
                </li>
            </ul>
        </div>
        <button @click="submitNewAction" class="btn btn-primary mt-2">カードを追加</button>
            </div>
    </div>
    `
});
const Mount_CardsVue = CardsVueApp.mount('#cards');
export { Mount_CardsVue };