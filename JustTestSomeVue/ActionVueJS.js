const ActionVueApp = createApp({
    data() {
        return {
            sharedState,
            //LimitBreak: {},
            //MainAction: {},
            //SubAction: {},
            //InstantAction: {},
            // 定義其他類型的 action 資料陣列
        };
    },
    mounted() {
        //this.getJobDataApi();
    },
    methods: {
        async getJobDataApi() {
            try {/*
                const response = await axios.get('./Jsons/White Mage.json');
                this.LimitBreak = response.data.LimitBreak;
                this.MainAction = response.data.MainAction;
                this.SubAction = response.data.SubAction;
                this.InstantAction = response.data.InstantAction;*/

                console.log("jsonData = " + JSON.stringify(sharedState.AdventurerBaseInfo.LimitBreak, null, 2));
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
    data() {
        return {
            showAddActionClick: false // 用于控制 add-action 组件的显示和隐藏
        }
    }
    ,
    methods: {
        handleAddAction(newAction) {
            if (newAction.Combowith != '') {
                newAction.IsCombo = "ComboNode"
                newAction.IsComboEnd = "ComboEnd"
                const ComboRootIndex = this.actionobject.Actions.findIndex(action => action.Name === newAction.Combowith);
                alert(ComboRootIndex);
                // 插入新的action
                this.actionobject.Actions.splice(ComboRootIndex + 1, 0, newAction);
                this.actionobject.Actions[ComboRootIndex].IsComboEnd = undefined;
                return;
            }
            this.actionobject.Actions.push(newAction);
            this.showAddActionClick = false; // 隐藏新增动作组件
        },
    },
    template: `
    <div :class="[actionobject.ActionSubject,'SubjectTab'] ">
            <div class="SubjectTitel">
                <h1>{{ actionobject.SubjectTitel }}</h1>
                &nbsp
                <h3> {{ actionobject.SubjectTitel_Word }}</h3>
            </div>
            <div class="SubjectTitel" v-if="actionobject.SubjectTitel_Tip">
                <p>{{ actionobject.SubjectTitel_Tip }}</p>
            </div>
            <div class="ActionList ComboTree">
                <div v-for="action in actionobject.Actions" :key="action.Name" class="Action" :class=[action.IsCombo,action.IsComboEnd]>
                    <div class="ActionCardBorder">
                        <table class="ActionDetail">
                            <tr>
                                <td rowspan="2" class="ActionIcon">
                                        <img :src="[action.ActionIconPath]" :alt="[action.Name]">
                                </td>
                                <td class="ActionTitel">
                                        <div class="ActionName">
                                            <h3>{{ action.Name }}</h3>
                                        </div>
                                        <div class="ActionType">
                                            <span>{{action.ActionType}}</span>
                                        </div>
                                        <div class="ActionUsed"  v-if="action.UsageCount" v-for="Usage in action.UsageCount">
                                            <input type="checkbox"  v-model="Usage"/>
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
                <div 
                    @click="this.showAddActionClick = !this.showAddActionClick"
                    class="add-action-button"
                  >
                    + ニューアクション
                </div>
                    <add-action v-if="this.showAddActionClick" @add-action="handleAddAction"></add-action>
                </div>
            </div>
    `,

});
ActionVueApp.component('add-action', {
    data() {
        return {
            sharedState,
            newAction: {
                Name: '',
                ActionType: '',
                ActionIconPath: 'https://xivapi.com/i/000000/000786_hr1.png',
                UsageCount: [],
                Cost: '',
                Target: '',
                Range: '',
                Determination: '',
                Timing: '',
                ActionEffect: '',
                DirectHit: '',
                Limit: '',
                ActionTips: '',
                Combowith: ''
            }
        }
    },
    template: `
    <div class="Action AddAction">
                    <div class="ActionCardBorder">
                        <table class="ActionDetail">
                            <tr>
                                <td rowspan="2" class="ActionIcon preview-container">
                                    <input type="file" id="imgFile" name="imgFile" accept="image/*" class="choose-button" v-model="newAction.ActionIconPath" @change="handleIconFileInputChange">
                                    <img id="previewImg" src="https://xivapi.com/i/000000/000786_hr1.png" alt="圖片預覽">
                                </td>
                                <td class="ActionTitel">
                                        <div class="ActionName">
                                            <h3><input v-model="newAction.Name" /></h3>
                                        </div>
                                        <div class="ActionType">
                                            <span><input v-model="newAction.ActionType" /></span>
                                        </div>
                                        <div>
                                            <button @click="AddUsageCount">+</button>
                                            <button @click="ReduceUsageCount">-</button>
                                        </div>
                                        <div class="ActionUsed"  v-if="newAction.UsageCount" v-for="Usage in newAction.UsageCount">
                                            <input type="checkbox"  v-model="Usage"/>
                                        </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="ActionMiscellaneous">
                                        <div class="Cost">
                                            <span class="MiscellaneousTitel">コスト：</span><span> <input v-model="newAction.Cost" /></span>
                                        </div>
                                        <div class="Target">
                                            <span class="MiscellaneousTitel">対象：</span><span><input v-model="newAction.Target" /></span>
                                        </div>
                                        <div class="Range">
                                            <span class="MiscellaneousTitel">範囲：</span><span><input v-model="newAction.Range" /></span>
                                        </div>
                                        <div class="Determination">
                                            <span
                                                class="MiscellaneousTitel">判定：</span><span><input v-model="newAction.Determination" /></span>
                                        </div>
                                        <div class="Timing">
                                            <span class="MiscellaneousTitel">タイミング：</span><span><input v-model="newAction.Timing" /></span>
                                        </div>
                                    </div>

                                </td>
                            </tr>
                        </table>
                        <div class="ActionEffect">
                            <span>基本効果： <input v-model="newAction.ActionEffect" /></span>
                        </div>
                        <div class="DirectHit" >
                            <span>ダイレクトヒット時： <input v-model="newAction.DirectHit" /></span>
                        </div>
                        <div class="Limit" >
                            <span>制限： <input v-model="newAction.Limit" /></span>
                        </div>
                        <div>
                            <span>コンボ条件：</span>
                            <select v-model="newAction.Combowith">
                                <option v-for="option in sharedState.AdventurerBaseInfo.MainAction.Actions" v-bind:value="option.Name">
                                    {{ option.Name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="Action ActionTips" >
                        <span><input v-model="newAction.ActionTips" /></span>
                    </div>
                </div>
            <button @click="submitNewAction">ニューアクション</button>
    </div>
    `,
    methods: {
        submitNewAction() {
            this.$emit('add-action', { ...this.newAction });
            this.resetNewAction();
        },
        AddUsageCount() {
            this.newAction.UsageCount.push(false);
        },
        ReduceUsageCount() {
            this.newAction.UsageCount.pop(false);
        },
        handleIconFileInputChange(event) {
            // 取得選擇的檔案
            var selectedFile = event.target.files[0];

            // 如果有選擇檔案
            if (selectedFile) {
                // 建立FileReader物件
                const reader = new FileReader();

                // 設定當讀取完成後的動作
                reader.onload = (e) => {
                    // 在這裡取得圖片的資料URL
                    this.newAction.ActionIconPath = e.target.result;
                    document.getElementById('previewImg').setAttribute('src', e.target.result);
                };
                // 讀取檔案內容
                reader.readAsDataURL(selectedFile);
            }
        },
        resetNewAction() {
            this.newAction = {
                Name: '',
                ActionType: '',
                ActionIconPath: 'https://xivapi.com/i/000000/000786_hr1.png',
                UsageCount: [],
                Cost: '',
                Target: '',
                Range: '',
                Determination: '',
                Timing: '',
                ActionEffect: '',
                DirectHit: '',
                Limit: '',
                ActionTips: '',
                Combowith: ''
            };
            document.getElementById('previewImg').setAttribute('src', "https://xivapi.com/i/000000/000786_hr1.png");
        }
    }

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