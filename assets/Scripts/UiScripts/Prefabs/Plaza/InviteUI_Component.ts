import { _decorator, EditBox, Label, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { GlobalData } from "../../../Runtime/GlobalData";
import { WAITING_TYPE } from "../Common/CircleLoadingUI_Component";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import PlazaEvents from "../../../Network/SocketIo/PlazaEvents";
const { ccclass, menu } = _decorator;

@ccclass("InviteUI_Component")
@menu("Hidden/InviteUI_Component")
export class InviteUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _myCodeLabel: Label = null;

  private _bindAgentNode: Node = null;

  private _agentCodeEditBox: EditBox = null;

  private _myAgentNode: Node = null;

  private _myAgentCodeLabel: Label = null;

  private _myAgentNickameLabel: Label = null;

  start() {
    this.renderPlayerInfo();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 获取我的邀请码标签组件
    [, this._myCodeLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/InviteInfo/MyCode/Value",
      Label,
    );

    // 获取绑定代理节点
    this._bindAgentNode = this.getNode(
      "MainView/Content/ScrollView/view/content/MainContent/InviteInfo/BindAgent",
    );

    // 获取代理邀请码输入框组件
    [, this._agentCodeEditBox] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/InviteInfo/BindAgent/AgentCode/Value",
      EditBox,
    );
    this._agentCodeEditBox.maxLength = 8;
    this._agentCodeEditBox.inputMode = EditBox.InputMode.NUMERIC;
    this._agentCodeEditBox.inputFlag = EditBox.InputFlag.DEFAULT;

    // 获取我的代理节点
    this._myAgentNode = this.getNode(
      "MainView/Content/ScrollView/view/content/MainContent/InviteInfo/MyAgent",
    );

    // 获取我的代理邀请码标签组件
    [, this._myAgentCodeLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/InviteInfo/MyAgent/InviteCode",
      Label,
    );

    // 获取我的代理昵称标签组件
    [, this._myAgentNickameLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/InviteInfo/MyAgent/Nickname",
      Label,
    );

    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/MainContent/InviteInfo/BindAgent/OKBtn",
      0,
      "onBindAgentBtnClick",
      this.getClassName(),
    );

    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());
  }

  /**
   * 关闭弹窗
   */
  public close() {
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 绑定代理按钮点击事件
   * @param event
   */
  public onBindAgentBtnClick(event: Event) {
    console.log(`onBindAgentBtnClick--->`, this._agentCodeEditBox.string);
    try {
      if (this._agentCodeEditBox.string.trim() === "") {
        return;
      }
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.BINDING_AGENT);
      // TODO - 调用绑定代理接口
      console.log(
        ` 调用绑定代理接口，代理邀请码：${this._agentCodeEditBox.string}`,
      );
      PlazaEvents.bindAgent(Number(this._agentCodeEditBox.string));
    } catch (error) {
      CommonDailogHandler.showBubbleMessage("绑定失败！" + error);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.BINDING_AGENT);
    }
  }

  /**
   * 渲染玩家信息
   */
  public renderPlayerInfo() {
    // 是否已绑定代理
    const isBindAgent = GlobalData.Instance.getCurrentPlayerInfo()?.agent_id
      ? true
      : false;

    this._bindAgentNode.active = !isBindAgent;
    this._myAgentNode.active = isBindAgent;

    this._myCodeLabel.string = String(
      GlobalData.Instance.getCurrentPlayerInfo()?.invite_code ?? "",
    );

    this._myAgentCodeLabel.string = String(
      GlobalData.Instance.getCurrentPlayerInfo()?.agent_invite_code ?? "",
    );

    this._myAgentNickameLabel.string = String(
      GlobalData.Instance.getCurrentPlayerInfo()?.agent_nickname ?? "",
    );
  }
}
