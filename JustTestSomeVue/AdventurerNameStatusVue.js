const AdventurerNameStatusVueApp = createApp({
    data() {
        return {
            sharedState,
            editMode: false,
            ShowAddAdditionalInfoClick: false,
            editState:{},
            mainStats: [
                { key: 'STR', label: 'STR' },
                { key: 'DEX', label: 'DEX' },
                { key: 'VIT', label: 'VIT' },
                { key: 'INT', label: 'INT' },
                { key: 'MND', label: 'MND' }
            ],
            subStats: [
                { key: 'PhysicalDefense', label: '物理防御力' },
                { key: 'MagicDefense', label: '魔法防御力' },
                { key: 'Vigilance', label: '警戒値' },
                { key: 'Speed', label: '移動速度' }
            ]
        };
    },
    mounted() {
        this.getJobDataApi();
    },
    methods: {
        toggleEditMode() {
            this.editMode = !this.editMode;
            if (this.editMode) {
                this.editState = JSON.parse(JSON.stringify(this.sharedState.AdventurerBaseInfo));
            }
        },
        saveEdit() {
            this.editMode = false;
            this.editState={};
        },
        cancelEdit() {
            this.editMode = false;
            this.editState={};
            Object.assign(this.sharedState.AdventurerBaseInfo, this.editState);
        },
        handleAdventurerImageChange(event) {
            var selectedFile = event.target.files[0];
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.sharedState.AdventurerBaseInfo.AdventurerImage = e.target.result;
                };
                reader.readAsDataURL(selectedFile);
            }
        },
        handleAddAdditionalInfo(newInfo) {
            this.sharedState.AdventurerBaseInfo.AdventurerJobTips.push(newInfo);
            this.ShowAddAdditionalInfoClick = false;
        },
        async getJobDataApi() {
            try {
                const response = await axios.get('./Jsons/White Mage.json');
                sharedState.AdventurerBaseInfo = response.data;
                console.log(sharedState.Adventurerstatus.MainStatus);
                sharedState.Adventurerstatus = sharedState.AdventurerBaseInfo.AdventurerStatus.find(adventurer => adventurer.AdventurerLevel === 30);
                console.log(sharedState.Adventurerstatus.MainStatus);
                console.log(sharedState.MainStatus);
                sharedState.MainStatus = sharedState.Adventurerstatus.MainStatus;
                sharedState.SubStatus = sharedState.Adventurerstatus.SubStatus;
                //console.log("jsonData = "+JSON.stringify(this.LimitBreak, null, 2));
            } catch (error) {
                console.error('Error loading JSON data:', error);
            }
        },
        handleAddAdditionalInfo(newAdditionalInfo) {
            this.sharedState.AdventurerBaseInfo.AdventurerJobTips.push(newAdditionalInfo);
        }
    },

});
AdventurerNameStatusVueApp.component('add-additional-info', {
    data() {
        return {
            sharedState,
            newAdditionalInfo: {
                TipTitel: '',
                TipType: '',
                TipDitel: ''
            }
        }
    },
    template: `
    <div class="TitTitle">
        <h3>特性や補足説明タイトル：<input v-model="newAdditionalInfo.TipTitel" /></h3>
        <p>タイプ：<input v-model="newAdditionalInfo.TipType" /></p>
    </div>
    <div class="TipDitel">
        <span>説明：<input v-model="newAdditionalInfo.TipDitel" /></span>
    </div>
    <button @click="submitNewAction">ニュー特性や補足説明</button>
    `,
    methods: {
        submitNewAction() {
            this.$emit('add-info', { ...this.newAdditionalInfo });
            this.resetNewAction();
        },
        resetNewAction() {
            this.newAdditionalInfo = {
                TipTitel: '',
                TipType: '',
                TipDitel: ''
            };
        }
    }

});
AdventurerNameStatusVueApp.mount('#Character-Information');