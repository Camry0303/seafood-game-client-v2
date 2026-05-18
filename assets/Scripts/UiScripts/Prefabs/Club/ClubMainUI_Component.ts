import {
  _decorator,
  Event,
  instantiate,
  Node,
  Prefab,
  Size,
  Toggle,
  ToggleContainer,
  UITransform,
  view,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { InformationMarquee_Component } from "../../Components/Common/InformationMarquee_Component";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { GameSettingUI_Component } from "../GameSetting/GameSettingUI_Component";
import { GlobalData } from "../../../Runtime/GlobalData";
import { ClubSettingUI_Component } from "./ClubSettingUI_Component";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import { Gateway } from "../../../Types/gateway";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { ClubToggle_Component } from "./ClubToggle_Component";
import { CLUB_PLAYER_ROLE } from "../../../Enums";
import { MemberManagementUI_Component } from "./MemberManagementUI_Component";
import {
  GetMemberListParams,
  GetMemberManagementListParams,
} from "../../../Types/gateway/requested/club";
import { MemberListUI_Component } from "./MemberListUI_Component";
const { ccclass, menu } = _decorator;

@ccclass("ClubMainUI_Component")
@menu("Hidden/ClubMainUI_Component")
export class ClubMainUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _mainViewUITransform: UITransform = null;

  private _clubToggleContainer: ToggleContainer = null;
  private _clubContentNode: Node = null;

  private _settingBtnNode: Node = null;
  private _memberManagementBtnNode: Node = null;
  private _memberBtnNode: Node = null;
  private _partnerBtnNode: Node = null;
  private _myMemberBtnNode: Node = null;
  private _scoreRankBtnNode: Node = null;
  private _gameRecordBtnNode: Node = null;
  private _scoreOperateLogBtnNode: Node = null;

  private _invitePlayerBtnNode: Node = null;
  private _createTableBtnNode: Node = null;

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
    // 获取玩家加入的俱乐部列表
    ClubEvents.getPlayerClubList();
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
    [this._settingBtnNode] = this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/SettingBtn",
      0,
      "onClubSettingBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部成员管理按钮点击事件
    [this._memberManagementBtnNode] = this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/MemberManagementBtn",
      0,
      "onClubMemberManagementBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部成员按钮点击事件
    [this._memberBtnNode] = this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/MemberBtn",
      0,
      "onClubMemberBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部合伙人按钮点击事件
    [this._partnerBtnNode] = this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/PartnerBtn",
      0,
      "onClubPartnerBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部我的成员按钮点击事件
    [this._myMemberBtnNode] = this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/MyMemberBtn",
      0,
      "onClubMyMemberBtnClick",
      this.getClassName(),
    );

    [
      // 设置俱乐部积分排行按钮点击事件
      this._scoreRankBtnNode,
    ] = this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/ScoreRankBtn",
      0,
      "onClubScoreRankBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部战绩按钮点击事件
    [this._gameRecordBtnNode] = this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/GameRecordBtn",
      0,
      "onClubGameRecordBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部上下分记录日志按钮点击事件
    [this._scoreOperateLogBtnNode] = this.setButtonClickEvent(
      "MainView/Content/RightContent/TopMenu/ScoreOperateLogBtn",
      0,
      "onClubScoreOperateLogBtnClick",
      this.getClassName(),
    );

    // 设置邀请玩家按钮点击事件
    [this._invitePlayerBtnNode] = this.setButtonClickEvent(
      "MainView/Content/RightContent/ButtonPanel/InvitePlayerBtn",
      0,
      "onInvitePlayerBtnClick",
      this.getClassName(),
    );

    // 设置创建房间按钮点击事件
    [this._createTableBtnNode] = this.setButtonClickEvent(
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
    // 如果在俱乐部中，则退出俱乐部
    if (GlobalData.Instance.getCurrentClubInfoDetail()) {
      ClubEvents.leaveClub();
    }
    this._bubbleWindow.close(() => {
      // 销毁节点
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 渲染俱乐部列表
   * @param clubList
   */
  public renderClubList(clubList: Gateway.Returned.Club.Club[]) {
    // 渲染俱乐部列表
    this._clubContentNode.removeAllChildren();
    const clubTogglePrefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Club/ClubToggle",
    );

    clubList.forEach((club) => {
      const clubToggleNode = instantiate(clubTogglePrefab);
      const clubToggleComponent =
        clubToggleNode.addComponent(ClubToggle_Component);
      clubToggleComponent.setData(club);
      this._clubContentNode.addChild(clubToggleNode);
    });

    // 设置默认进入第一个俱乐部
    const nodes = this._clubContentNode.children;
    if (nodes.length > 0) {
      const node = nodes[0];
      const toggle = node.getComponent(Toggle);
      toggle.setIsCheckedWithoutNotify(true);
      this._clubToggleContainer.notifyToggleCheck(toggle);
    }
  }

  /**
   * 俱乐部列表切换容器选中事件
   * @param event
   */
  private onClubToggleCheck(event: Event) {
    const toggle: Toggle = event.target.getComponent(Toggle);
    const clubToggle = toggle.getComponent(ClubToggle_Component);
    if (clubToggle.getData()) {
      ClubEvents.enterClub(clubToggle.getData().club_id);
    }
  }

  /**
   * 加入俱乐部按钮点击事件
   * @param event
   */
  private onJoinClubBtnClick(event: Event) {
    CommonDailogHandler.showDialogMiniKeyboard(
      "JoinClubToggle",
      6,
      (value: string) => {
        // 加入俱乐部
        const club_id = parseInt(value, 10);
        ClubEvents.joinClubById(club_id);
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
        isRequired: false,
        maxLength: 8,
        placeholder: "输入俱乐部名称",
        height: 60,
        defaultValue: "",
        showLimitInfo: false,
      },
      (inputValue: string) => {
        if (inputValue.trim()) {
          // 创建俱乐部
          ClubEvents.createClub(inputValue);
        }
      },
    );
  }

  /**
   * 俱乐部设置按钮点击事件
   * @param event
   */
  private onClubSettingBtnClick(event: Event) {
    // 打开俱乐部设置
    ComponentManager.Instance.renderUiNode<ClubSettingUI_Component>(
      "ClubSettingUI",
      "Prefabs",
      "Club/ClubSettingUI",
      ClubSettingUI_Component,
    );
  }

  /**
   * 俱乐部成员管理按钮点击事件
   * @param event
   */
  private onClubMemberManagementBtnClick(event: Event) {
    console.log(`onClubMemberManagementBtnClick--->`);

    const params: GetMemberManagementListParams = {
      current: 1,
      pageSize: 1000,
    };
    ClubEvents.getMemberManagementList(params);
  }

  /**
   * 俱乐部成员按钮点击事件
   * @param event
   */
  private onClubMemberBtnClick(event: Event) {
    console.log(`onClubMemberBtnClick--->`);

    const params: GetMemberListParams = {
      current: 1,
      pageSize: 1000,
    };
    ClubEvents.getMemberList(params);
  }

  /**
   * 俱乐部合伙人按钮点击事件
   * @param event
   */
  private onClubPartnerBtnClick(event: Event) {
    // TODO - 俱乐部合伙人
    console.log(`onClubPartnerBtnClick--->`);
  }

  /**
   * 俱乐部我的成员按钮点击事件
   * @param event
   */
  private onClubMyMemberBtnClick(event: Event) {
    // TODO - 俱乐部我的成员
    console.log(`onClubMyMemberBtnClick--->`);
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

  /**
   * 渲染俱乐部详情内容
   */
  public renderClubDetailContent() {
    const clubDetail = GlobalData.Instance.getCurrentClubInfoDetail();
    const clubPlayer = GlobalData.Instance.getCurrentClubPlayerInfo();
    if (!clubDetail || !clubPlayer) {
      return;
    }
    const role = clubPlayer.role;

    // 按钮相关
    switch (role) {
      // 管理员和副管理员拥有相同的界面权限
      case CLUB_PLAYER_ROLE.ADMIN:
      case CLUB_PLAYER_ROLE.SUB_ADMIN:
        // 设置按钮
        this._settingBtnNode.active = true;
        // 成员管理按钮
        this._memberManagementBtnNode.active = true;
        // 成员按钮
        this._memberBtnNode.active = true;
        // 合伙人按钮
        this._partnerBtnNode.active = true;
        // 我的成员按钮
        this._myMemberBtnNode.active = false;
        // 积分排行按钮
        this._scoreRankBtnNode.active = true;
        // 战绩按钮
        this._gameRecordBtnNode.active = true;
        // 上下分记录日志按钮
        this._scoreOperateLogBtnNode.active = true;
        // 邀请玩家按钮
        this._invitePlayerBtnNode.active = true;
        // 创建房间按钮
        this._createTableBtnNode.active = true;
        break;
      case CLUB_PLAYER_ROLE.PARTNER:
        // 设置按钮
        this._settingBtnNode.active = true;
        // 成员管理按钮
        this._memberManagementBtnNode.active = false;
        // 成员按钮
        this._memberBtnNode.active = true;
        // 合伙人按钮
        this._partnerBtnNode.active = false;
        // 我的成员按钮
        this._myMemberBtnNode.active = true;
        // 积分排行按钮
        this._scoreRankBtnNode.active = true;
        // 战绩按钮
        this._gameRecordBtnNode.active = true;
        // 上下分记录日志按钮
        this._scoreOperateLogBtnNode.active = true;
        // 邀请玩家按钮
        this._invitePlayerBtnNode.active = true;
        // 创建房间按钮
        this._createTableBtnNode.active = false;
        break;
      default:
        // 设置按钮
        this._settingBtnNode.active = true;
        // 成员管理按钮
        this._memberManagementBtnNode.active = false;
        // 成员按钮
        this._memberBtnNode.active = true;
        // 合伙人按钮
        this._partnerBtnNode.active = false;
        // 我的成员按钮
        this._myMemberBtnNode.active = false;
        // 积分排行按钮
        this._scoreRankBtnNode.active = true;
        // 战绩按钮
        this._gameRecordBtnNode.active = true;
        // 上下分记录日志按钮
        this._scoreOperateLogBtnNode.active = true;
        // 邀请玩家按钮
        this._invitePlayerBtnNode.active = false;
        // 创建房间按钮
        this._createTableBtnNode.active = false;
        break;
    }

    // 公告相关
    if (clubDetail.announcement) {
      this._marqueeComponent.node.active = true;
      this._marqueeComponent.setMessages([clubDetail.announcement]);
    } else {
      this._marqueeComponent.node.active = false;
      this._marqueeComponent.setMessages([]);
    }

    // TODO - 获取游戏桌子列表
    console.log(`获取游戏桌子列表请求`);
  }

  /**
   * 渲染俱乐部游戏桌子列表
   * @param tableList
   */
  public renderClubGameTableList(tableList: any[]) {
    // TODO - 渲染俱乐部游戏桌子列表
    console.log(`渲染游戏桌子列表--->`, tableList);
  }

  /**
   * 更新选中Toggle俱乐部名称
   */
  public updateCheckedToggleClubName(club_id: number, club_name: string) {
    const toggles = this._clubToggleContainer.toggleItems;
    for (const toggle of toggles) {
      const clubToggle = toggle.getComponent(ClubToggle_Component);
      if (clubToggle.getData()?.club_id === club_id) {
        clubToggle?.updateClubName(club_name);
        break;
      }
    }

    const [node, component] = ComponentManager.Instance.getNodeComponent(
      "ClubSettingUI",
      ClubSettingUI_Component,
    );
    component && component.updateClubName(club_name);
  }

  /**
   * 更新俱乐部公告
   * @param announcement
   */
  public updateAnnouncement(announcement: string) {
    this._marqueeComponent.setMessages([announcement]);
    const [node, component] = ComponentManager.Instance.getNodeComponent(
      "ClubSettingUI",
      ClubSettingUI_Component,
    );
    component && component.close(); // 关闭设置界面
  }

  /**
   * 设置申请提示
   * @param club_id
   * @param diff
   */
  public setApplicationHint(club_id: number, diff: number) {
    const toggles = this._clubToggleContainer.toggleItems;
    for (const toggle of toggles) {
      const clubToggle = toggle.getComponent(ClubToggle_Component);
      const clubData = clubToggle.getData();
      if (clubData?.club_id === club_id) {
        clubData.has_hint += diff;
        clubToggle?.updateApplicationHint();
        break;
      }
    }
  }
}
