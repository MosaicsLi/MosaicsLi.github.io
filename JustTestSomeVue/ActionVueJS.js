const ActionVueApp = createApp({
    data() {
        return {
            LimitBreak: {},
            MainAction: {
                ActionType: "MainAction",
                Actions: [
                    { name: 'Action Name 1', details: 'Details about action 1' },
                    { name: 'Action Name 2', details: 'Details about action 2' },
                    { name: 'Action Name 3', details: 'Details about action 2' },
                    { name: 'Action Name 4', details: 'Details about action 2' },
                    { name: 'Action Name 5', details: 'Details about action 2' },
                    { name: 'Action Name 6', details: 'Details about action 2' },
                    { name: 'Action Name 2', details: 'Details about action 2' },
                    { name: 'Action Name 2', details: 'Details about action 2' },
                    { name: 'Action Name 2', details: 'Details about action 2' },
                    { name: 'Action Name 2', details: 'Details about action 2' },
                    // 可以添加更多的 action 物件
                ]
            },
            SubAction: {
                ActionType: "SubAction",
                Actions: [
                    { name: 'Action Name 1', details: 'Details about action 1' },
                    { name: 'Action Name 2', details: 'Details about action 2' },
                    { name: 'Action Name 2', details: 'Details about action 2' },
                    { name: 'Action Name 2', details: 'Details about action 2' },
                    // 可以添加更多的 action 物件
                ]
            },
            InstantAction: {
                ActionType: "InstantAction",
                Actions: [
                    { name: 'Action Name 1', details: 'Details about action 1' },
                    { name: 'Action Name 2', details: 'Details about action 2' },
                    // 可以添加更多的 action 物件
                ]
            },
            // 定義其他類型的 action 資料陣列
        };
    },
    mounted() {
        this.getJobDataApi();
    },
    methods: {
        async getJobDataApi() {
            try {
                const response = await axios.get('./Jsons/White Mage.json');
                this.LimitBreak = response.data.LimitBreak;
                this.MainAction = response.data.MainAction;
                this.SubAction = response.data.SubAction;
                this.InstantAction = response.data.InstantAction;
                //console.log("jsonData = "+JSON.stringify(this.LimitBreak, null, 2));
            } catch (error) {
                console.error('Error loading JSON data:', error);
            }
        },
    },
});
ActionVueApp.component('customgrid', {
    props: {
        actionobject: Object,  // 接收包含不同 action 資訊的陣列
    },
    template: `
    <div :class="[actionobject.ActionType,'ActionCardBorder'] ">
        <div class="ActionType">
            <h2>{{ actionobject.ActionType }}</h2>
        </div>
        <div class="ActionList">
        <div v-for="action in actionobject.Actions" :key="action.name" class="action">
          <h3>{{ action.name }}</h3>
          <span>{{ action.details }}</span>
        </div>
        </div>
    </div> `,

});
ActionVueApp.component('action', {
    props: {
        actionobject: Object,  // 接收包含不同 action 資訊的陣列
    },
    template: `
    <div :class="[actionobject.ActionSubject+'-SubjectTitel'] ">
        <div class="SubjectTitel">
            <h1>{{ actionobject.SubjectTitel }}</h1>
            &nbsp
            <h3> {{ actionobject.SubjectTitel_Word }}</h3>
        </div>
        <div class="ActionList">
            <div v-for="action in actionobject.Actions" :key="action.Name" >
                <div class="Action ActionCardBorder">
                    <div class="ActionDetail">
                        <div class="ActionIcon">
                            <img :src="[action.ActionIconPath]" :alt="[action.Name]">
                        </div>
                        <div class="ActionName">
                            <h3>{{ action.Name }}</h3>
                        </div>
                        <div class="ActionType">
                            <span>{{action.ActionType}}</span>
                        </div>
                        <div class="Cost" v-if="action.Cost">
                          <span>コスト：{{action.Cost}}</span>
                        </div>
                        <div class="Target" v-if="action.Target">
                          <span>対象：{{action.Target}}</span>
                        </div>
                        <div class="Range" v-if="action.Range">
                          <span>範囲：{{action.Range}}</span>
                        </div>
                        <div class="Determination" v-if="action.Determination">
                          <span>判定：{{action.Determination}}</span>
                        </div>
                        <div class="Timing" v-if="action.Timing">
                          <span>タイミング：{{action.Timing}}</span>
                        </div>
                    </div>
                    <div class="ActionEffect">
                      <span>基本効果：{{action.ActionEffect}}</span>
                    </div>
                    <div class="DirectHit" v-if="action.DirectHit">
                      <span>ダイレクトヒット時：{{action.DirectHit}}</span>
                    </div>
                </div>
                <div class="Action ActionTips" v-if="action.ActionTips">
                    <span>{{action.ActionTips}}</span>
                </div>
            </div>
        </div>
    </div>
    `,

});

ActionVueApp.component('limitbreak', {
    props: {
        limitbreakobject: Object,  // 接收包含不同 action 資訊的陣列
    },
    template: `
<div class="LimitBreak ActionCardBorder">
    <div class="LimitBreakDetail">
      <div class="LimitBreakIcon">
        <img :src="[limitbreakobject.ActionIconPath]" alt="Limit Break Image">
      </div>
      <div class="LimitBreakName">
        <h3>リミットブレイク：{{ limitbreakobject.LimitBreakName }}</h3>
      </div>
      <div class="ActionType">
        <span>{{limitbreakobject.ActionType}}</span>
      </div>
      <div class="Timing">
        <span>タイミング：{{limitbreakobject.Timing}}</span>
      </div>
      <div class="Target">
        <span>対象：{{limitbreakobject.Target}}</span>
      </div>
      <div class="Range">
        <span>範囲：{{limitbreakobject.Range}}</span>
      </div>
    </div>
    <div class="ActionEffect">
      <span>基本効果：{{limitbreakobject.ActionEffect}}</span>
    </div>
</div>
    `,

});

ActionVueApp.mount('#CharacterActions');