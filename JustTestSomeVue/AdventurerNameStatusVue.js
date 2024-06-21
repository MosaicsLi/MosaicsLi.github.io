const AdventurerNameStatusVueApp = createApp({
    data() {
        return {
            sharedState,
            ShowAddAdditionalInfoClick:false
        };
    },
    mounted() {
        this.getJobDataApi();
    },
    methods: {
        async getJobDataApi() {
            try {
                const response = await axios.get('./Jsons/White Mage.json');
                sharedState.AdventurerBaseInfo = response.data;
                console.log(sharedState.Adventurerstatus.MainStatus);
                sharedState.Adventurerstatus = sharedState.AdventurerBaseInfo.AdventurerStatus.find(adventurer => adventurer.AdventurerLevel === 30);
                console.log(sharedState.Adventurerstatus.MainStatus);
                console.log(sharedState.MainStatus);
                //sharedState.MainStatus = sharedState.Adventurerstatus.MainStatus;
                //sharedState.SubStatus = sharedState.Adventurerstatus.SubStatus;
                //console.log("jsonData = "+JSON.stringify(this.LimitBreak, null, 2));
            } catch (error) {
                console.error('Error loading JSON data:', error);
            }
        },
        handleAddAdditionalInfo(newAdditionalInfo){
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
            this.newAdditionalInfo= {
                TipTitel: '',
                TipType: '',
                TipDitel: ''
            };
        }
    }

});
AdventurerNameStatusVueApp.mount('#Character-Information');