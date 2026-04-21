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
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { GameSettingUI_Component } from "../GameSetting/GameSettingUI_Component";
import { GlobalData } from "../../../Runtime/GlobalData";
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

    // 设置俱乐部设置按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/SettingBtn",
      0,
      "onClubSettingBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部成员管理按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/MemberManageBtn",
      0,
      "onClubMemberManageBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部成员按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/MemberBtn",
      0,
      "onClubMemberBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部合伙人按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/PartnerBtn",
      0,
      "onClubPartnerBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部积分排行按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/ScoreRankBtn",
      0,
      "onClubScoreRankBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部战绩按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/GameRecordBtn",
      0,
      "onClubGameRecordBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部上下分记录日志按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/ScoreOperateLogBtn",
      0,
      "onClubScoreOperateLogBtnClick",
      this.getClassName(),
    );

    // 设置邀请玩家按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/RightContent/ButtonPanel/InvitePlayerBtn",
      0,
      "onInvitePlayerBtnClick",
      this.getClassName(),
    );

    // 设置创建房间按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/RightContent/ButtonPanel/CreateRoomBtn",
      0,
      "onCreateRoomBtnClick",
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
    console.log(`onJoinClubBtnClick--->`);
    CommonDailogHandler.showDialogMiniKeyboard(
      "InvitePlayerToggle",
      6,
      (value: string) => {
        console.log("俱乐部ID--->", value);
        // TODO - 加入俱乐部
        console.log("加入俱乐部");
        CommonDailogHandler.showBubbleMessage(`加入俱乐部:${value}`);
      },
    );
  }

  /**
   * 创建俱乐部按钮点击事件
   * @param event
   */
  private onCreateClubBtnClick(event: Event) {
    CommonDailogHandler.showDialogInput(
      "CreateClubToggle",
      {
        isRequired: true,
        maxLength: 8,
        placeholder: "输入俱乐部名称",
        height: 60,
        defaultValue: "",
        showLimitInfo: true,
      },
      (inputValue: string) => {
        // TODO - 创建俱乐部
        console.log(`确认回调--->`, inputValue);
      },
    );
  }

  /**
   * 俱乐部设置按钮点击事件
   * @param event
   */
  private onClubSettingBtnClick(event: Event) {
    // TODO - 俱乐部设置
    console.log(`onClubSettingBtnClick--->`);
  }

  /**
   * 俱乐部成员管理按钮点击事件
   * @param event
   */
  private onClubMemberManageBtnClick(event: Event) {
    // TODO - 俱乐部成员管理
    console.log(`onClubMemberManageBtnClick--->`);
  }

  /**
   * 俱乐部成员按钮点击事件
   * @param event
   */
  private onClubMemberBtnClick(event: Event) {
    // TODO - 俱乐部成员
    console.log(`onClubMemberBtnClick--->`);
  }

  /**
   * 俱乐部积分排行按钮点击事件
   * @param event
   */
  private onClubPartnerBtnClick(event: Event) {
    // TODO - 俱乐部合伙人
    console.log(`onClubPartnerBtnClick--->`);
  }

  /**
   * 俱乐部积分排行按钮点击事件
   * @param event
   */
  private onClubScoreRankBtnClick(event: Event) {
    // TODO - 俱乐部积分排行
    console.log(`onClubScoreRankBtnClick--->`);
  }

  /**
   * 俱乐部战绩按钮点击事件
   * @param event
   */
  private onClubGameRecordBtnClick(event: Event) {
    // TODO - 俱乐部战绩
    console.log(`onClubGameRecordBtnClick--->`);
  }

  /**
   * 俱乐部上下分记录日志按钮点击事件
   * @param event
   */
  private onClubScoreOperateLogBtnClick(event: Event) {
    // TODO - 俱乐部上下分记录日志
    console.log(`onClubScoreOperateLogBtnClick--->`);
  }

  /**
   * 邀请玩家按钮点击事件
   * @param event
   */
  private onInvitePlayerBtnClick(event: Event) {
    CommonDailogHandler.showDialogMiniKeyboard(
      "InvitePlayerToggle",
      6,
      (value: string) => {
        console.log("玩家ID--->", value);
        // TODO - 邀请玩家
        console.log("邀请玩家");
        CommonDailogHandler.showBubbleMessage(`邀请玩家:${value}`);
      },
    );
  }

  /**
   * 创建房间按钮点击事件
   * @param event
   */
  private onCreateRoomBtnClick(event: Event) {
    const [node, component] =
      ComponentManager.Instance.renderUiNode<GameSettingUI_Component>(
        "GameSettnigUI",
        "Prefabs",
        "GameSetting/GameSettingUI",
        GameSettingUI_Component,
      );
    component.setData("CLUB", GlobalData.Instance.defaultClubDicesConfig);
  }
}
