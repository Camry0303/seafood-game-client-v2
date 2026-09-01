import { Logger } from "../../../Utils/Logger";
import {
  _decorator,
  Event,
  EditBox,
  Label,
  Node,
  UITransform,
  Overflow,
  HorizontalTextAlignment,
  VerticalTextAlignment,
  ToggleContainer,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { UI } from "../../../Types/typing";
import { NewEventHandler } from "../../../Utils/AddEventHandler";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

@ccclass("DialogInputUI_Component")
@menu("Hidden/DialogInputUI_Component")
export class DialogInputUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _titleToggleContainer: ToggleContainer = null;

  private _callbackFunction: Function = null;

  private _editBoxNode: Node = null;

  private _editBoxComponent: EditBox = null;

  private _labelNode: Node = null;

  private _labelComponent: Label = null;

  private _limitNode: Node = null;

  private _limitLabel: Label = null;

  private _isRequired: boolean = false;

  start() {}

  // 更新函数，接收一个deltaTime参数，表示时间间隔
  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node.addComponent(BubbleWindow);

    [, this._titleToggleContainer] = this.getNodeComponent(
      "MainView/Title",
      ToggleContainer,
    );

    // 设置确定按钮事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Form/ButtonPanel/OKBtn",
      0,
      "onConfirmBtnClick",
      this.getClassName(),
    );

    // 设置取消按钮事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Form/ButtonPanel/CancelBtn",
      0,
      "close",
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

    // 获取输入文本组件
    [this._editBoxNode, this._editBoxComponent] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Form/Input/Value",
      EditBox,
    );

    // 获取显示文本组件
    [this._labelNode, this._labelComponent] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Form/Input/Value/TEXT_LABEL",
      Label,
    );

    // 获取限制文本组件
    [this._limitNode, this._limitLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Form/Input/Value/LIMIT_LABEL",
      Label,
    );

    // 监听输入框文本变化
    this._editBoxComponent.textChanged[0] = NewEventHandler(
      this.node,
      this.getClassName(),
      "onTextInputChanged",
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
   * 初始化输入框属性
   * @param props
   * @param callback
   */
  public setInputProperty(props: UI.InputProperty, callback: Function) {
    // 设置回调函数
    this._callbackFunction = callback;

    this._limitNode.active = props.showLimitInfo;
    this._limitLabel.string = `${props.defaultValue?.length || 0}/${
      props.maxLength
    }`;
    this._editBoxComponent.placeholder = props.placeholder;
    this._editBoxComponent.maxLength = props.maxLength;
    this._editBoxNode.getComponent(UITransform).height = props.height;
    this._editBoxComponent.string = props.defaultValue || "";
    this._labelComponent.overflow =
      props.overFlow === undefined ? Overflow.SHRINK : props.overFlow;
    this._labelComponent.horizontalAlign = HorizontalTextAlignment.LEFT;
    this._labelComponent.verticalAlign = VerticalTextAlignment.CENTER;

    this._isRequired = props.isRequired ? true : false;
  }

  /**
   * 确定按钮点击事件
   */
  private onConfirmBtnClick(event: Event) {
    Logger.log(`DialogInputUI_Component onConfirmBtnClick`);
    if (this._isRequired && this._editBoxComponent.string.trim().length === 0) {
      CommonDailogHandler.showBubbleMessage("输入内容不能为空！");
      return;
    }
    if (this._callbackFunction) {
      this._callbackFunction(this._editBoxComponent.string);
      this.close();
    } else {
      CommonDailogHandler.showBubbleMessage("回调函数未定义！");
    }
  }

  /**
   * 文本改变触发事件
   * @param changedText
   * @param event
   */
  private onTextInputChanged(changedText: string) {
    this._limitLabel.string = `${changedText.length}/${this._editBoxComponent.maxLength}`;
  }
}
