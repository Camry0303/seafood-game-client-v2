import { _decorator, Event, Label, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { UI } from "../../../Types/typing";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

@ccclass("DialogMsgCallbackUI_Component")
@menu("Hidden/DialogMsgCallbackUI_Component")
export class DialogMsgCallbackUI_Component extends ComponentController {
  public bubbleWindow: BubbleWindow = null;

  private _callbackFunction: Function = null;

  private _tipsNode: Node = null;

  private _tipsLabel: Label = null;

  private _messageLabelNode: Node = null;

  private _messageLabel: Label = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this.bubbleWindow = this.node.addComponent(BubbleWindow);

    // 设置确定按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/LayoutContent/ButtonPanel/ConfirmBtn",
      0,
      "onConfirmBtnClick",
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

    const [tipsNode, tipsLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/LayoutContent/Tips",
      Label,
    );
    this._tipsNode = tipsNode;
    this._tipsLabel = tipsLabel;

    const [messageLabelNode, messageLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/LayoutContent/MessageLabel",
      Label,
    );
    this._messageLabelNode = messageLabelNode;
    this._messageLabel = messageLabel;
  }

  /**
   * 关闭弹窗
   */
  public close() {
    this.bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 确定按钮点击事件
   */
  private onConfirmBtnClick(event: Event) {
    if (this._callbackFunction) {
      this._callbackFunction(this._messageLabel.string);
      this.close();
    } else {
      CommonDailogHandler.showBubbleMessage("回调函数未定义！");
    }
  }

  /**
   * 设置提示消息
   * @param props
   * @param callback
   */
  public setMessage(props: UI.MsgCallbackProperty, callback: Function) {
    // 设置回调函数
    this._callbackFunction = callback;
    this._tipsLabel.string = props.tips;
    this._messageLabel.string = props.message;
    const [buttonNode, buttonText] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/LayoutContent/ButtonPanel/ConfirmBtn/Label",
      Label,
    );
    buttonText.string = props.confirmText || "确定";
  }
}
