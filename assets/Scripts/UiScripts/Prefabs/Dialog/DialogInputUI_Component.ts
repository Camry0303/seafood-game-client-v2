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
  public bubbleWindow: BubbleWindow = null;

  private _callbackFunction: Function = null;

  private _tipsNode: Node = null;

  private _tipsLabel: Label = null;

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
    this.bubbleWindow = this.node.addComponent(BubbleWindow);

    // 设置确定按钮事件
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

    const [editBoxNode, editBoxComponent] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/LayoutContent/InputPanel/EditBox",
      EditBox,
    );
    this._editBoxNode = editBoxNode;
    this._editBoxComponent = editBoxComponent;

    const [labelNode, labelComponent] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/LayoutContent/InputPanel/EditBox/TEXT_LABEL",
      Label,
    );
    this._labelNode = labelNode;
    this._labelComponent = labelComponent;

    const [limitNode, limitLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/LayoutContent/InputPanel/EditBox/LIMIT_LABEL",
      Label,
    );
    this._limitNode = limitNode;
    this._limitLabel = limitLabel;

    // 监听输入框文本变化
    editBoxComponent.textChanged[0] = NewEventHandler(
      this.node,
      this.getClassName(),
      "onTextInputChanged",
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
   * 初始化输入框属性
   * @param props
   * @param callback
   */
  public setInputProperty(props: UI.InputProperty, callback: Function) {
    // 设置回调函数
    this._callbackFunction = callback;
    this._tipsLabel.string = props.tips;
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
    this._labelComponent.horizontalAlign = HorizontalTextAlignment.CENTER;
    this._labelComponent.verticalAlign = VerticalTextAlignment.CENTER;

    this._isRequired = props.isRequired ? true : false;
  }

  /**
   * 确定按钮点击事件
   */
  private onConfirmBtnClick(event: Event) {
    console.log(`DialogInputUI_Component onConfirmBtnClick`);
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
