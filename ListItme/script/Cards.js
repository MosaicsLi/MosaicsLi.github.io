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
            editMode: false,
            showAddCardClick: false,
            editingCardIndex: null,
            showEditCardClick: false,
        }
    },
    methods: {
        handleAddCard(newCard) {
            sharedState.CardsList.push(newCard);
            this.showAddCardClick = false;
        },
        toggleEditMode() {
            this.editMode = !this.editMode;
        },
        deleteAction(index) {
            sharedState.CardsList.splice(index, 1);
        },
        /*
        handleEditCard(card, index) {
            this.editingCardIndex = index;
            this.showEditCardClick = true;
        },
        handleUpdateCard(updatedCard) {
            if (this.editingCardIndex !== null) {
                sharedState.CardsList[this.editingCardIndex] = updatedCard;
                this.editingCardIndex = null;
                this.showEditCardClick = false;
            }
        },*/
        handleEditCard(card, index) {
            this.editingCardIndex = index;
            this.showEditCardClick = true;

        },
        handleUpdateCard(updatedCard) {
            if (this.editingCardIndex !== null) {
                sharedState.CardsList[this.editingCardIndex] = updatedCard;
                this.editingCardIndex = null;
                this.showEditCardClick = false;

            }
        },
    },
    template: `
    <div class="cards">
        <button @click="toggleEditMode" class="btn btn-sm btn-secondary mb-2">
            {{ editMode ? '完了' : '編集モード' }}
        </button>

        <card
            v-for="(cardobject, index) in cardlistarray"
            :key="cardobject.Title || index"
            :card="cardobject"
            :card-index="index"
            :edit-mode="editMode"
            @edit-card="handleEditCard(cardobject, index)"
            @delete-card="deleteAction(index)"
        ></card>

        <div @click="showAddCardClick = !showAddCardClick" class="add-cards-button">+ ニューアクション</div>
        <add-card v-if="showAddCardClick" @add-card="handleAddCard"></add-card>
        <edit-card
            v-if="showEditCardClick"
            :original-card="cardlistarray[editingCardIndex]"
            :card-index="editingCardIndex"
            @update-card="handleUpdateCard"
        ></edit-card>
        
    </div>
    `
});
CardsVueApp.component('card', {
    props: {
        card: Object,
        cardIndex: Number,
        editMode: Boolean
    },
    template: `
    <div :id="'card-' + cardIndex" class="card position-relative">
        <a class="nav-link" :href="card.CardHref">
            <div class="card-content text-white">
                <h2 class="mt-5">{{card.Title}}</h2>
                <p>{{card.Introduction}}</p>
                <p v-if="card.Link.length">I steal from those web site :</p>
                <a :href="Link" v-for="(Link, index) in card.Link" :key="index">{{Link}}</a>
            </div>
        </a>
        <div v-if="editMode" class="card-controls position-absolute top-0 end-0 p-2">
        <a href="#edit">
            <button class="btn btn-sm btn-warning me-1" @click="$emit('edit-card')">編集</button>
        </a>
            <button class="btn btn-sm btn-danger" @click="$emit('delete-card')">削除</button>
        </div>
    </div>
    `
});
CardsVueApp.component('edit-card', {
    props: {
        originalCard: Object,
        cardIndex: Number
    },
    data() {
        return {
            editedCard: JSON.parse(JSON.stringify(this.originalCard)), // 深拷貝
            linkInput: ''
        }
    },
    methods: {
        updateCard() {
            this.$emit('update-card', { ...this.editedCard });
        },
        addLink() {
            if (this.linkInput.trim()) {
                this.editedCard.Link.push(this.linkInput.trim());
                this.linkInput = '';
            }
        },
        removeLink(index) {
            this.editedCard.Link.splice(index, 1);
        }
    },
    template: `
    <div id="edit" class="card">
            <div class="card-content text-white">
        <h5>カードを編集</h5>
        <div class="mb-2">
            <label>タイトル:</label>
            <input v-model="editedCard.Title" class="form-control" />
        </div>
        <div class="mb-2">
            <label>リンク先 (CardHref):</label>
            <input v-model="editedCard.CardHref" class="form-control" />
        </div>
        <div class="mb-2">
            <label>紹介文:</label>
            <textarea v-model="editedCard.Introduction" class="form-control"></textarea>
        </div>
        <div class="mb-2">
            <label>参照リンク:</label>
            <div class="input-group mb-2">
                <input v-model="linkInput" class="form-control" />
                <button @click="addLink" class="btn btn-outline-secondary">追加</button>
            </div>
            <ul class="list-group">
                <li v-for="(link, index) in editedCard.Link" :key="index" class="list-group-item d-flex justify-content-between">
                    {{ link }}
                    <button @click="removeLink(index)" class="btn btn-sm btn-danger">削除</button>
                </li>
            </ul>
        </div>
        <a :href="'#card-' + cardIndex">
            <button @click="updateCard" class="btn btn-success" href="#app">保存</button>
        </a>
        </div>
    </div>
    `
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