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

        <div @click="showAddCardClick = !showAddCardClick" class="add-cards-button">+ ニューカット</div>
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
    data() {
        return {
            flipped: false
        };
    },
    methods: {
        toggleFlip() {
            this.flipped = !this.flipped;
        }
    },
    template: `
    <div
      class="card flashcard text-center"
      :id="'card-' + cardIndex"
      @click="toggleFlip"
      style="cursor: pointer; transition: transform 0.6s; "
    >
      <div class="card-content text-white py-5">
        <div v-if="!flipped">
          <h2>{{ card.TermA }}</h2> <!-- 原語言 -->
        </div>
        <div v-else>
          <h2>{{ card.TermB }}</h2> <!-- 翻譯語言 -->
          <p v-if="card.Notes">{{ card.Notes }}</p>
        </div>
      </div>
      <div v-if="editMode" class="card-controls position-absolute top-0 end-0 p-2">
        <a href="#edit">
            <button class="btn btn-sm btn-warning me-1" @click="$emit('edit-card')">編集</button>
        </a>
        <button class="btn btn-sm btn-danger" @click.stop="$emit('delete-card')">削除</button>
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
            editedCard: JSON.parse(JSON.stringify(this.originalCard))
        };
    },
    methods: {
        updateCard() {
            this.$emit('update-card', {
                ...this.editedCard,
                index: this.cardIndex // 傳回 index 給父層
            });
        }
    },
    template: `
    <div id="edit" class="card">
            <div class="card-content text-white">
      <h5>単語カードを編集（#{{ cardIndex + 1 }} </h5>
      <div class="mb-2">
        <label>原語（例：English）:</label>
        <input v-model="editedCard.TermA" class="form-control" />
      </div>
      <div class="mb-2">
        <label>翻訳（例：日本語）:</label>
        <input v-model="editedCard.TermB" class="form-control" />
      </div>
      <div class="mb-2">
        <label>補足（例：例句や品詞）:</label>
        <textarea v-model="editedCard.Notes" class="form-control"></textarea>
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
                TermA: '', // 原語
                TermB: '', // 對應翻譯語
                Notes: ''  // 補充說明，可選
            }
        }
    },
    methods: {
        submitNewAction() {
            const cardToEmit = { ...this.newCard };
            this.$emit('add-card', cardToEmit);
            this.resetNewCard();
        },
        resetNewCard() {
            this.newCard = {
                TermA: '', // 原語
                TermB: '', // 對應翻譯語
                Notes: ''  // 補充說明，可選
            };
        }
    },
    template: `
    <div class="card">
            <div class="card-content text-white">
      <h5>単語カードを追加</h5>
      <div class="mb-2">
        <label>原語（例：English）:</label>
        <input v-model="newCard.TermA" class="form-control" />
      </div>
      <div class="mb-2">
        <label>翻訳（例：日本語）:</label>
        <input v-model="newCard.TermB" class="form-control" />
      </div>
      <div class="mb-2">
        <label>補足（例：例句や品詞）:</label>
        <textarea v-model="newCard.Notes" class="form-control"></textarea>
      </div>
      <button @click="submitNewAction" class="btn btn-primary mt-2">追加</button>
    </div>
    </div>
  `
});

const Mount_CardsVue = CardsVueApp.mount('#cards');
export { Mount_CardsVue };