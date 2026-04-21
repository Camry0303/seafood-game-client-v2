import { _decorator, Event, Node, Label, ToggleContainer, Toggle } from "cc";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

@ccclass("DialogMiniKeyboardUI_Component")
@menu("Hidden/DialogMiniKeyboardUI_Component")
export class DialogMiniKeyboardUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _titleToggleContainer: ToggleContainer = null;

  private _valueNode: Node = null;

  private _confirmCallback: Function = null;

  private _numDigits: number = 0;

  private _valueString: string = "";

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    [, this._titleToggleContainer] = this.getNodeComponent(
      "MainView/Title",
      ToggleContainer,
    );

    this._valueNode = this.getNode("MainView/Content/Layout/Value");

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
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 设置小键盘弹窗内容
   * @param message
   * @param callback
   */
  public setDialogMiniKeyboard(
    title: "JoinRoomToggle" | "InvitePlayerToggle" | "JoinClubToggle",
    numDigits: 2 | 4 | 6,
    callback: Function,
  ) {
    this._numDigits = numDigits;
    this._confirmCallback = callback;
    const titleNode = this._titleToggleContainer.node.children.find(
      (node) => node.name === title,
    );
    const titleToggle = titleNode.getComponent(Toggle);
    titleToggle.isChecked = true;
    this._titleToggleContainer.notifyToggleCheck(titleToggle);
  }

  /**
   * 数字按钮点击事件
   * @param event
   * @param num
   */
  private onNumBtnClick(event: Event, num: number) {
    // 限制输入长度
    if (this._valueString.length >= this._numDigits) {
      return;
    }
    const valueArr = this._valueString.split("");
    valueArr.push(num.toString());
    this._valueString = valueArr.join("");

    const valueDigitNodes = this._valueNode.children;

    valueDigitNodes.forEach((node, index) => {
      if (index >= valueArr.length) {
        node.getChildByName("Label").getComponent(Label).string = "";
        return;
      }
      node.getChildByName("Label").getComponent(Label).string =
        valueArr[index] || "";
    });
  }

  /**
   * 清除按钮点击事件
   * @param event
   */
  private onClearBtnClick(event: Event) {
    this._valueString = "";
    const valueDigitNodes = this._valueNode.children;
    valueDigitNodes.forEach((node) => {
      node.getChildByName("Label").getComponent(Label).string = "";
    });
  }

  /**
   * 完成输入
   */
  private onInputFinish() {
    const value = this._valueString;
    if (!value.trim()) {
      CommonDailogHandler.showBubbleMessage("请输入有效数字！");
      return;
    }
    this._confirmCallback(value);
    this.close();
  }
}
