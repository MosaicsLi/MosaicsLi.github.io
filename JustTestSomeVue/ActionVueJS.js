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
                
                //console.log("jsonData = " + JSON.stringify(sharedState.AdventurerBaseInfo.LimitBreak, null, 2));
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
            editMode: false, // 控制編輯模式的顯示和隱藏
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
        toggleEditMode() {
            this.editMode = !this.editMode;
        },
        handleIconFileInputChange(action) {
            // 取得選擇的檔案
            var selectedFile = event.target.files[0];

            // 如果有選擇檔案
            if (selectedFile) {
                // 建立FileReader物件
                const reader = new FileReader();

                // 設定當讀取完成後的動作
                reader.onload = (e) => {
                    // 在這裡取得圖片的資料URL
                    action.ActionIconPath = e.target.result;
                };
                // 讀取檔案內容
                reader.readAsDataURL(selectedFile);
            }
        },
        AddUsageCount(action) {
            console.log(action)
            if (!action.hasOwnProperty("UsageCount")) {
                action.UsageCount = [];
            }
            action.UsageCount.push(false);
        },
        ReduceUsageCount(action) {
            action.UsageCount.pop(false);
        },
        deleteAction(action) {
            const index = this.actionobject.Actions.indexOf(action);
            if (index > -1) {
                this.actionobject.Actions.splice(index, 1);
            }
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
                <div v-for="action in actionobject.Actions"  class="Action" :class="[action.IsCombo,action.IsComboEnd]">
                    <action :action="action"  @delete-action="deleteAction"></action>
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
ActionVueApp.component('action', {
    props: {
        action: Object,  // 接收包含不同 action 資訊的陣列
    },
    data() {
        return {
            editMode: false, // 控制編輯模式的顯示和隱藏
            oldaction: {},
            actionList:{}
        }
    },
    emits: ['delete-action'], // 声明 delete-action 事件
    methods: {
        toggleEditMode() {
            this.editMode = !this.editMode;
            if (this.editMode) {
                this.oldaction = JSON.parse(JSON.stringify(this.action));
            }
        },
        saveEdit() {
            this.editMode = false;
            this.oldaction={};
        },
        cancelEdit() {
            this.editMode = false;
            Object.assign(this.action, this.oldaction); // 更新 action 的內容
            this.oldaction={};
        },
        DeleteAction(){
            this.editMode = false;
            this.$emit('delete-action', this.action);
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
                    this.action.ActionIconPath = e.target.result;
                };
                // 讀取檔案內容
                reader.readAsDataURL(selectedFile);
            }
        },
        AddUsageCount() {
            if (!action.hasOwnProperty("UsageCount")) {
                action.UsageCount = [];
            }
            this.action.UsageCount.push(false);
        },
        ReduceUsageCount() {
            this.action.UsageCount.pop(false);
        },
    },
    template: `
    <div class="ActionCardBorder">
        <table class="ActionDetail">
            <tr>
                <td rowspan="2" class="ActionIcon">
                    <input v-if="editMode " type="file" accept="image/*" class="choose-button" @change="handleIconFileInputChange">
                    <img :src="[action.ActionIconPath]" :alt="[action.Name]">
                </td>
                <td class="ActionTitel">
                    <div class="ActionName">
                        <h3 v-if="!editMode ">{{ action.Name }}</h3>
                        <input v-if="editMode " v-model="action.Name">
                    </div>
                    <div class="ActionType">
                        <span v-if="!editMode ">{{action.ActionType}}</span>
                        <input v-if="editMode " v-model="action.ActionType">
                    </div>
                    <div v-if="editMode" >
                        <button v-if="editMode " @click="AddUsageCount">+</button>
                        <button v-if="editMode " @click="ReduceUsageCount">-</button>
                    </div>
                    <div class="ActionUsed" v-if="action.UsageCount" v-for="Usage in action.UsageCount">
                        <input type="checkbox" v-model="Usage"/>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="ActionMiscellaneous">
                        <div class="Cost" v-if="action.Cost||editMode">
                            <span class="MiscellaneousTitel">コスト：</span>
                            <span v-if="!editMode ">{{action.Cost}}</span>
                            <input v-if="editMode " v-model="action.Cost">
                        </div>
                        <div class="Target" v-if="action.Target||editMode">
                            <span class="MiscellaneousTitel">対象：</span>
                            <span v-if="!editMode ">{{action.Target}}</span>
                            <input v-if="editMode " v-model="action.Target">
                        </div>
                        <div class="Range" v-if="action.Range||editMode">
                            <span class="MiscellaneousTitel">範囲：</span>
                            <span v-if="!editMode ">{{action.Range}}</span>
                            <input v-if="editMode " v-model="action.Range">
                        </div>
                        <div class="Determination" v-if="action.Determination||editMode">
                            <span class="MiscellaneousTitel">判定：</span>
                            <span v-if="!editMode ">{{action.Determination}}</span>
                            <input v-if="editMode " v-model="action.Determination">
                        </div>
                        <div class="Timing" v-if="action.Timing||editMode">
                            <span class="MiscellaneousTitel">タイミング：</span>
                            <span v-if="!editMode ">{{action.Timing}}</span>
                            <input v-if="editMode " v-model="action.Timing">
                        </div>
                    </div>
                </td>
            </tr>
        </table>
        <div class="ActionEffect">
            <span>基本効果：</span>
            <span v-if="!editMode ">{{action.ActionEffect}}</span>
            <input v-if="editMode " v-model="action.ActionEffect">
        </div>
        <div class="DirectHit" v-if="action.DirectHit||editMode">
            <span>ダイレクトヒット時：</span>
            <span v-if="!editMode ">{{action.DirectHit}}</span>
            <input v-if="editMode " v-model="action.DirectHit">
        </div>
        <div class="Limit" v-if="action.Limit||editMode">
            <span>制限：</span>
            <span v-if="!editMode ">{{action.Limit}}</span>
            <input v-if="editMode " v-model="action.Limit">
        </div>
        <div v-if="action.Combowith&&editMode">
            <span>コンボ条件：</span>
            <input v-if="editMode " v-model="action.Combowith">
            <span>IsComboEnd：</span>
            <input v-model="action.IsComboEnd"/>
        </div>
        <div v-if="editMode" class="edit-buttons">
            <button @click="saveEdit">保存</button>
            <button @click="cancelEdit">取消</button>
            <button @click="DeleteAction">削除</button>
        </div>
        <button v-if="!editMode" @click="toggleEditMode">エディット</button>
    </div>
    <div class="ActionTips" v-if="action.ActionTips||editMode">
        <span v-if="!editMode ">{{action.ActionTips}}</span>
        <input v-if="editMode " v-model="action.ActionTips">
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
                                    <input type="file" accept="image/*" class="choose-button" v-model="newAction.ActionIconPath" @change="handleIconFileInputChange">
                                    <img :src="[newAction.ActionIconPath]" alt="圖片預覽">
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
ActionVueApp.component('limitbreak-but-table', {
    props: {
        limitbreakobject: {
            ActionIconPath:"",
            LimitBreakName:"",
            ActionType:"",
            Timing:"",
            Target:"",
            Range:"",
            ActionEffect:""
        },  // 接收包含不同 action 資訊的陣列
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