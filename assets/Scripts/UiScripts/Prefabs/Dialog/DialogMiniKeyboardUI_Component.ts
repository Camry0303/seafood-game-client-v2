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

  private _pendingTitle: string = null;

  private _valueNode: Node = null;

  private _confirmCallback: Function = null;

  private _numDigits: number = 0;

  private _isConfirmed: boolean = false;

  private _isClosing: boolean = false;

  private _valueString: string = "";

  // Value 下 6 个数字格（Digit1~Digit6）各自的 Label，按位缓存
  private _valueLabels: Label[] = [];

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    [, this._titleToggleContainer] = this.getNodeComponent(
      "MainView/Title",
      ToggleContainer,
    );

    this._valueNode = this.getNode("MainView/Content/Layout/Value");

    // 按 Digit1~Digit6 精确定位并缓存每一位的 Label，
    // 不再依赖 _valueNode.children 的顺序，避免错位或漏渲染
    this._valueLabels = [];
    for (let i = 1; i <= 6; i++) {
      const digitNode = this.getNode(`MainView/Content/Layout/Value/Digit${i}`);
      const label =
        digitNode?.getChildByName("Label")?.getComponent(Label) || null;
      if (label) {
        // prefab 中该 Label 为 cacheMode=CHAR(2) + overflow=SHRINK(2)。
        // SHRINK 会基于初始空文本算出缩放，CHAR 缓存又不会在文本由空变数字时
        // 重新排版，二者叠加会导致"值已更新但界面不显示"。
        // 这里改为 NONE：文本变化立即重绘；数字格尺寸固定，也无需 SHRINK 缩放。
        label.cacheMode = Label.CacheMode.NONE;
        label.overflow = Label.Overflow.NONE;
      }
      this._valueLabels.push(label);
    }
    console.log(
      "[MiniKeyboard] onLoad valueNode=",
      !!this._valueNode,
      "labels=",
      this._valueLabels.filter(Boolean).length,
    );

    // _titleToggleContainer 已就绪，应用待处理的标题高亮（若已设置）
    if (this._pendingTitle) {
      this.applyTitle(this._pendingTitle);
      this._pendingTitle = null;
    }

    // 兜底：新实例/重开时确保输入区为空
    this.resetInput();

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
    // 幂等保护：关闭动画期间重复点 Close/Mask 会让 BubbleWindow 复用同一
    // tween（只 stop 不重建）并丢弃新回调，导致动画反复启停，这里直接忽略。
    if (this._isClosing) {
      return;
    }
    this._isClosing = true;
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 重置输入状态（清空内容并允许再次提交），作为关闭后重开的兜底。
   * _valueNode 未就绪时只重置字段，显示清空由 onLoad 内再次调用兜底。
   */
  private resetInput() {
    this._valueString = "";
    this._isConfirmed = false;
    this._isClosing = false;
    this.renderValue();
  }

  /**
   * 把当前输入按位渲染到 Value 的 6 个数字格（每位一个独立 Label）。
   * 某位未取到 Label 时跳过，避免抛错中断整个输入流程。
   */
  private renderValue() {
    const chars = this._valueString.split("");
    for (let i = 0; i < this._valueLabels.length; i++) {
      const label = this._valueLabels[i];
      if (!label) {
        continue;
      }
      label.string = i < chars.length ? chars[i] : "";
    }
  }

  /**
   * 设置小键盘弹窗内容
   * @param message
   * @param callback
   */
  public setDialogMiniKeyboard(
    title:
      | "JoinRoomToggle"
      | "InvitePlayerToggle"
      | "JoinClubToggle"
      | "AddScoreToggle"
      | "SubScoreToggle"
      | "AddPartnerToggle"
      | "AddPartnerMemberToggle"
      | "SetDealerToggle",
    numDigits: 2 | 4 | 6,
    callback: Function,
  ) {
    this._numDigits = numDigits;
    this._confirmCallback = callback;
    // onLoad 为延迟执行，_titleToggleContainer 此时可能尚未赋值，
    // 先缓存标题，待 onLoad 内再应用，避免同步访问抛错。
    this._pendingTitle = title;
    if (this._titleToggleContainer) {
      this.applyTitle(title);
    }
    // 兜底：关闭后重开清空上次输入（_valueNode 未就绪时仅重置字段，显示由 onLoad 内兜底）
    this.resetInput();
  }

  /**
   * 应用标题高亮（需在 _titleToggleContainer 就绪后调用）
   */
  private applyTitle(title: string) {
    if (!this._titleToggleContainer) {
      return;
    }
    const titleNode = this._titleToggleContainer.node.children.find(
      (node) => node.name === title,
    );
    if (!titleNode) {
      return;
    }
    const titleToggle = titleNode.getComponent(Toggle);
    if (!titleToggle) {
      return;
    }
    titleToggle.isChecked = true;
    this._titleToggleContainer.notifyToggleCheck(titleToggle);
  }

  /**
   * 数字按钮点击事件
   * @param event
   * @param num
   */
  public onNumBtnClick(event: Event, num: string) {
    console.log(
      "[MiniKeyboard] click num=",
      JSON.stringify(num),
      "numDigits=",
      this._numDigits,
      "labels=",
      this._valueLabels.filter(Boolean).length,
    );
    if (this._isConfirmed) {
      return;
    }
    // 限制输入长度
    if (this._valueString.length >= this._numDigits) {
      return;
    }
    // num 实际是 Button 的 customEventData（字符串 "0"~"9"），直接拼接即可。
    // 不要用 "".split("")（JS 中返回 [""] 会导致首格空串、末位被裁）。
    this._valueString += num;
    this.renderValue();
  }

  /**
   * 清除按钮点击事件
   * @param event
   */
  public onClearBtnClick(event: Event) {
    if (this._isConfirmed) {
      return;
    }
    this._valueString = "";
    this.renderValue();
  }

  /**
   * 完成输入
   */
  public onInputFinish() {
    if (this._isConfirmed) {
      return;
    }
    if (typeof this._confirmCallback !== "function") {
      console.error("[DialogMiniKeyboardUI] confirmCallback 未设置，无法提交输入");
      return;
    }
    const value = this._valueString;
    if (!value.trim()) {
      CommonDailogHandler.showBubbleMessage("请输入有效数字！");
      return;
    }
    // 仅在校验通过、真正提交后才置位：空输入只提示，
    // 不应锁死键盘导致用户此后无法继续输入。
    this._isConfirmed = true;
    this._confirmCallback(value);
    this.close();
  }
}
