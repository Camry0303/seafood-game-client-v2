import {
  _decorator,
  Event,
  Node,
  Size,
  Toggle,
  ToggleContainer,
  UITransform,
  view,
  Widget,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { InformationMarquee_Component } from "../../Components/Common/InformationMarquee_Component";
const { ccclass, menu } = _decorator;

@ccclass("ClubMainUI_Component")
@menu("Hidden/ClubMainUI_Component")
export class ClubMainUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _mainViewUITransform: UITransform = null;

  private _clubToggleContainer: ToggleContainer = null;

  private _clubContentNode: Node = null;

  private _marqueeComponent: InformationMarquee_Component = null;

  private _tableContentNode: Node = null;

  start() {
    // 窗口大小组件
    [, this._mainViewUITransform] = this.getNodeComponent(
      "MainView",
      UITransform,
    );
    const height = view.getVisibleSize().height;
    this._mainViewUITransform.contentSize = new Size(
      (1136 * height) / 640,
      height,
    );
    // this.updateWidgets();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 俱乐部列表切换容器
    [this._clubContentNode, this._clubToggleContainer] = this.getNodeComponent(
      "MainView/Content/LeftMenu/ScrollView/view/content",
      ToggleContainer,
    );

    // 设置俱乐部列表切换容器选中事件
    this.setToggleContainerCheckEvent(
      "MainView/Content/LeftMenu/ScrollView/view/content",
      0,
      "onClubToggleCheck",
      this.getClassName(),
    );

    // 设置加入俱乐部按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/LeftMenu/ButtonPanel/JoinBtn",
      0,
      "onJoinClubBtnClick",
      this.getClassName(),
    );

    // 设置创建俱乐部按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/LeftMenu/ButtonPanel/CreateBtn",
      0,
      "onCreateClubBtnClick",
      this.getClassName(),
    );

    // 挂载组件到按钮跑马灯节点
    [, this._marqueeComponent] = this.addNodeComponent(
      "MainView/Content/RightContent/AnnoucementMarquee",
      InformationMarquee_Component,
    );

    // 获取桌子列表内容节点
    this._tableContentNode = this.getNode(
      "MainView/Content/RightContent/ScrollView/view/content",
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
   * 更新UI布局适配
   */
  private updateWidgets() {
    const [, contentWidget] = this.getNodeComponent("MainView/Content", Widget);
    contentWidget.updateAlignment();

    const [, leftMenuWidget] = this.getNodeComponent(
      "MainView/Content/LeftMenu",
      Widget,
    );
    leftMenuWidget.updateAlignment();

    const [, rightContentWidget] = this.getNodeComponent(
      "MainView/Content/RightContent",
      Widget,
    );
    rightContentWidget.updateAlignment();
  }

  /**
   * 俱乐部列表切换容器选中事件
   * @param event
   */
  private onClubToggleCheck(event: Event) {
    // TODO - 切换
    const toggle: Toggle = event.target.getComponent(Toggle);
    console.log(`onClubToggleCheck--->`, toggle);
  }

  /**
   * 加入俱乐部按钮点击事件
   * @param event
   */
  private onJoinClubBtnClick(event: Event) {
    // TODO - 加入俱乐部
    console.log(`onJoinClubBtnClick--->`, event);
  }

  /**
   * 创建俱乐部按钮点击事件
   * @param event
   */
  private onCreateClubBtnClick(event: Event) {
    // TODO - 创建俱乐部
    console.log(`onCreateClubBtnClick--->`, event);
  }
}
