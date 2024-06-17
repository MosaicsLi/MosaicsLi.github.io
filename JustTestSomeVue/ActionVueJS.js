const ActionVueApp = createApp({
    data() {
        return {
            LimitBreak: {},
            MainAction: {},
            SubAction: {},
            InstantAction: {},
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
ActionVueApp.component('action-but-table', {
    props: {
        actionobject: Object,  // 接收包含不同 action 資訊的陣列
    },
    template: `
    <div :class="[actionobject.ActionSubject,'SubjectTab'] ">
            <div class="SubjectTitel">
                <h1>{{ actionobject.SubjectTitel }}</h1>
                &nbsp
                <h3> {{ actionobject.SubjectTitel_Word }}</h3>
            </div>
            <div class="ActionList">
                <div v-for="action in actionobject.Actions" :key="action.Name" class="Action">
                    <div class="ActionCardBorder">
                        <table class="ActionDetail">
                            <tr>
                                <td rowspan="2" class="ActionIcon">
                                    <div>
                                        <img :src="[action.ActionIconPath]" :alt="[action.Name]">
                                    </div>
                                </td>
                                <td>
                                    <div class="ActionTitel">
                                        <div class="ActionName">
                                            <h3>{{ action.Name }}</h3>
                                        </div>
                                        <div class="ActionType">
                                            <span>{{action.ActionType}}</span>
                                        </div>
                                        <div class="ActionUsed"  v-if="action.UsageCount" v-for="Usage in action.UsageCount">
                                            <input type="checkbox"  v-model="Usage"/>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="ActionMiscellaneous">
                                        <div class="Cost" v-if="action.Cost">
                                            <span class="MiscellaneousTitel">コスト：</span><span>{{action.Cost}}</span>
                                        </div>
                                        <div class="Target" v-if="action.Target">
                                            <span class="MiscellaneousTitel">対象：</span><span>{{action.Target}}</span>
                                        </div>
                                        <div class="Range" v-if="action.Range">
                                            <span class="MiscellaneousTitel">範囲：</span><span>{{action.Range}}</span>
                                        </div>
                                        <div class="Determination" v-if="action.Determination">
                                            <span
                                                class="MiscellaneousTitel">判定：</span><span>{{action.Determination}}</span>
                                        </div>
                                        <div class="Timing" v-if="action.Timing">
                                            <span class="MiscellaneousTitel">タイミング：</span><span>{{action.Timing}}</span>
                                        </div>
                                    </div>

                                </td>
                            </tr>
                        </table>
                        <div class="ActionEffect">
                            <span>基本効果：{{action.ActionEffect}}</span>
                        </div>
                        <div class="DirectHit" v-if="action.DirectHit">
                            <span>ダイレクトヒット時：{{action.DirectHit}}</span>
                        </div>
                        <div class="Limit" v-if="action.Limit">
                            <span>制限：{{action.Limit}}</span>
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
      <div class="LimitType">
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
    <div class="LimitEffect">
      <span>基本効果：{{limitbreakobject.ActionEffect}}</span>
    </div>
</div>
    `,
});
ActionVueApp.component('limitbreak-but-table', {
    props: {
        limitbreakobject: Object,  // 接收包含不同 action 資訊的陣列
    },
    template: `
<div class="LimitBreak ActionCardBorder">
    <table class="LimitBreakDetail">
        <tr>
            <td class="LimitBreakIcon" rowspan="2">
                <div class="">
                  <img :src="[limitbreakobject.ActionIconPath]" alt="Limit Break Image">
                </div>
            </td>
            <td>
                <div class="ActionTitel">
                    <div class="ActionName">
                      <h3>リミットブレイク：{{ limitbreakobject.LimitBreakName }}</h3>
                    </div>
                    <div class="ActionType">
                      <span>{{limitbreakobject.ActionType}}</span>
                    </div>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="ActionMiscellaneous">
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
            </td>
        </tr>
    </table>
    <div class="LimitEffect">
      <span>基本効果：{{limitbreakobject.ActionEffect}}</span>
    </div>
</div>
    `,
});

ActionVueApp.mount('#CharacterActions');