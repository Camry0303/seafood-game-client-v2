import { _decorator, Event, Label, Node, Toggle, ToggleContainer } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameDialogConfirmSmallUI_Component")
@menu("Hidden/DicesGameDialogConfirmSmallUI_Component")
export class DicesGameDialogConfirmSmallUI_Component extends ComponentController {
  public bubbleWindow: BubbleWindow = null;

  private _titleToggleContainer: ToggleContainer = null;

  private _messageLabelNode: Node = null;

  private _messageLabel: Label = null;

  private _confirmCallback: Function = null;

  private _cancelCallback: Function = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this.bubbleWindow = this.node.addComponent(BubbleWindow);

    [, this._titleToggleContainer] = this.getNodeComponent(
      "MainView/Title",
      ToggleContainer,
    );

    // 设置确认按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ButtonPanel/OKBtn",
      0,
      "onConfirmBtnClick",
      this.getClassName(),
    );

    // 设置取消按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ButtonPanel/CancelBtn",
      0,
      "onCancelBtnClick",
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

    const [messageLabelNode, messageLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Message",
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
   * 设置弹窗内容
   * @param title
   * @param message
   * @param confirmCallback
   * @param cancelCallback
   */
  public setDialogConfirm(
    title: "ExitToggle" | "DissolveToggle",
    message: string,
    confirmCallback: Function,
    cancelCallback: Function,
  ) {
    const titleNode = this._titleToggleContainer.node.children.find(
      (node) => node.name === title,
    );
    const titleToggle = titleNode.getComponent(Toggle);
    titleToggle.isChecked = true;
    this._titleToggleContainer.notifyToggleCheck(titleToggle);

    this._messageLabel.string = message;
    this._confirmCallback = confirmCallback;
    this._cancelCallback = cancelCallback;
  }

  /**
   * 确定按钮点击事件
   */
  private onConfirmBtnClick(event: Event) {
    console.log(`DicesGameDialogConfirmSmallUI_Component onConfirmBtnClick`);
    if (this._confirmCallback) {
      this._confirmCallback();
      this.close();
    } else {
      CommonDailogHandler.showBubbleMessage("回调函数未定义！");
    }
  }

  /**
   * 取消按钮点击事件
   */
  private onCancelBtnClick(event: Event) {
    console.log(`DicesGameDialogConfirmSmallUI_Component onCancelBtnClick`);
    if (this._cancelCallback) {
      this._cancelCallback();
      this.close();
    } else {
      CommonDailogHandler.showBubbleMessage("回调函数未定义！");
    }
  }
}
