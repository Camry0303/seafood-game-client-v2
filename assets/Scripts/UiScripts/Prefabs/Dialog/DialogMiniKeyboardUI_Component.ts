import { _decorator, Event, Node, Label } from "cc";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

@ccclass("DialogMiniKeyboardUI_Component")
@menu("Hidden/DialogMiniKeyboardUI_Component")
export class DialogMiniKeyboardUI_Component extends ComponentController {
  public bubbleWindow: BubbleWindow = null;

  private _messageLabelNode: Node = null;

  private _messageLabel: Label = null;

  private _valueLabelNode: Node = null;

  private _valueLabel: Label = null;

  private _confirmCallback: Function = null;

  private _numDigits: number = 0;

  private _isConfirm: boolean = false;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this.bubbleWindow = this.node.addComponent(BubbleWindow);
    const [messageLabelNode, messageLabel] = this.getNodeComponent(
      "MainView/Content/Layout/Tips",
      Label,
    );

    const [valueLabelNode, valueLabel] = this.getNodeComponent(
      "MainView/Content/Layout/Value/Label",
      Label,
    );
    this._valueLabelNode = valueLabelNode;
    this._valueLabel = valueLabel;

    this._messageLabelNode = messageLabelNode;
    this._messageLabel = messageLabel;

    this.initButtons();
  }

  /**
   * 初始化按钮
   */
  private initButtons() {
    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());

    // 设置数字按钮点击事件
    for (let i = 0; i < 10; i++) {
      // 设置数字按钮点击事件
      this.setButtonClickEvent(
        `MainView/Content/Layout/Keyboard/NumBtn${i}`,
        0,
        "onNumBtnClick",
        this.getClassName(),
        `${i}`,
      );
    }

    // 设置清除按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/Layout/Keyboard/ClearBtn",
      0,
      "onClearBtnClick",
      this.getClassName(),
    );

    // 设置删除按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/Layout/Keyboard/DeleteBtn",
      0,
      "onDeleteBtnClick",
      this.getClassName(),
    );

    // 设置确认按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/Layout/Keyboard/ConfirmBtn",
      0,
      "onInputFinish",
      this.getClassName(),
    );
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
   * 设置小键盘弹窗内容
   * @param message
   * @param callback
   */
  public setDialogMiniKeyboard(
    message: string,
    numDigits: 2 | 4 | 6 | 8,
    callback: Function,
    isConfirm: boolean = false,
  ) {
    this._messageLabel.string = message;
    this._numDigits = numDigits;
    this._confirmCallback = callback;
    this._isConfirm = isConfirm;

    const ConfirmBtn = this.getNode(
      "MainView/Content/Layout/Keyboard/ConfirmBtn",
    );
    ConfirmBtn && (ConfirmBtn.active = isConfirm);

    const DeleteBtn = this.getNode(
      "MainView/Content/Layout/Keyboard/DeleteBtn",
    );
    DeleteBtn && (DeleteBtn.active = !isConfirm);
  }

  /**
   * 数字按钮点击事件
   * @param event
   * @param num
   */
  private onNumBtnClick(event: Event, num: number) {
    const valueArr = this._valueLabel.string.split("");
    valueArr.push(num.toString());
    this._valueLabel.string = valueArr.join("");
    if (!this._isConfirm && valueArr.length >= this._numDigits) {
      this.onInputFinish();
      return;
    }
  }

  /**
   * 清除按钮点击事件
   * @param event
   */
  private onClearBtnClick(event: Event) {
    this._valueLabel.string = "";
  }

  /**
   * 删除按钮点击事件
   * @param event
   */
  private onDeleteBtnClick(event: Event) {
    const valueArr = this._valueLabel.string.split("");
    valueArr.pop();
    this._valueLabel.string = valueArr.join("");
  }

  /**
   * 完成输入
   */
  private onInputFinish() {
    const value = this._valueLabel.string;
    if (!value.trim()) {
      CommonDailogHandler.showBubbleMessage("请输入有效数字！");
      return;
    }
    this._confirmCallback(value);
    this.close();
  }
}
