import { _decorator, Event, Label, native, Node, sys } from "cc";
import { SoundsManager } from "../../../Runtime/SoundsManager";
import { ComponentController } from "../../../Common/ComponentController";
import { GlobalData } from "../../../Runtime/GlobalData";
import { InformationMarquee_Component } from "../../Components/Common/InformationMarquee_Component";
import { PlazaPlayerInfo_Component } from "./PlazaPlayerInfo_Component";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { BindPhoneUI_Component } from "./BindPhoneUI_Component";
import { ActivityUI_Component } from "./ActivityUI_Component";
import { PlazaSettingUI_Component } from "./PlazaSettingUI_Component";
import { ShareUI_Component } from "./ShareUI_Component";
import { InviteUI_Component } from "./InviteUI_Component";
import { CustomerServiceUI_Component } from "./CustomerServiceUI_Component";
import { GameSettingUI_Component } from "../GameSetting/GameSettingUI_Component";
import { ClubMainUI_Component } from "../Club/ClubMainUI_Component";
import PlazaEvents from "../../../Network/SocketIo/PlazaEvents";
import { Gateway } from "../../../Types/gateway";
import { PlayerInfoEditUI_Component } from "./PlayerInfoEditUI_Component";
import { DicesGameRecordUI_Component } from "../Common/DicesGameRecordUI_Component";
const { ccclass, menu } = _decorator;

@ccclass("PlazaMainUI_Component")
@menu("Hidden/PlazaMainUI_Component")
export class PlazaMainUI_Component extends ComponentController {
  private _playerInfoNode: Node = null;
  private _playerInfoComponent: PlazaPlayerInfo_Component = null;

  private _informationMarqueeNode: Node = null;
  private _informationMarqueeComponent: InformationMarquee_Component = null;

  start() {
    // 播放大厅音乐
    if (sys.isNative) {
      SoundsManager.Instance.playMusic("bgm_01");
    } else {
      this.scheduleOnce(() => {
        SoundsManager.Instance.playMusic("bgm_01");
      }, 1);
    }

    // 获取跑马灯信息
    PlazaEvents.getMarquees();
    // 获取客服信息
    PlazaEvents.getCustomerService();
    // // NOTE - 此版本忽略 获取是否有俱乐部提示
    // PlazaEvents.getClubHasHint();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // // 获取版本号组件
    // const [, versionLabel] = this.getNodeComponent(
    //   "MainContainer/Version",
    //   Label,
    // );
    // versionLabel.string = GlobalData.Instance.getVersionString();

    // 挂载组件到玩家信息节点
    [this._playerInfoNode, this._playerInfoComponent] = this.addNodeComponent(
      "TopBar/PlayerInformation",
      PlazaPlayerInfo_Component,
    );

    // 挂载组件到按钮跑马灯节点
    [this._informationMarqueeNode, this._informationMarqueeComponent] =
      this.addNodeComponent(
        "MainContainer/InformationMarquee",
        InformationMarquee_Component,
      );

    // 设置绑定手机按钮点击事件
    this.setButtonClickEvent(
      "TopBar/TopMenu/BindPhoneBtn",
      0,
      "onBindPhoneBtnClick",
      this.getClassName(),
    );

    // 设置商城按钮点击事件
    this.setButtonClickEvent(
      "TopBar/TopMenu/ShopBtn",
      0,
      "onShopBtnClick",
      this.getClassName(),
    );

    // 设置活动按钮点击事件
    this.setButtonClickEvent(
      "TopBar/TopMenu/ActivityBtn",
      0,
      "onActivityBtnClick",
      this.getClassName(),
    );

    // 设置加入游戏卡片按钮点击事件
    this.setButtonClickEvent(
      "MainContainer/CardButtonPanel/JoinBtn",
      0,
      "onJoinGameCardBtnClick",
      this.getClassName(),
    );

    // 设置创建房间卡片按钮点击事件
    this.setButtonClickEvent(
      "MainContainer/CardButtonPanel/CreateBtn",
      0,
      "onCreateGameCardBtnClick",
      this.getClassName(),
    );

    // 设置俱乐部按钮点击事件
    this.setButtonClickEvent(
      "MainContainer/CardButtonPanel/ClubBtn",
      0,
      "onClubBtnClick",
      this.getClassName(),
    );

    // 设置设置按钮点击事件
    this.setButtonClickEvent(
      "BottomBar/SettingBtn",
      0,
      "onSettingBtnClick",
      this.getClassName(),
    );

    // 设置分享按钮点击事件
    this.setButtonClickEvent(
      "BottomBar/ShareBtn",
      0,
      "onShareBtnClick",
      this.getClassName(),
    );

    // 设置邀请按钮点击事件
    this.setButtonClickEvent(
      "BottomBar/InviteBtn",
      0,
      "onInviteBtnClick",
      this.getClassName(),
    );

    // 设置客服按钮点击事件
    this.setButtonClickEvent(
      "BottomBar/CustomerServiceBtn",
      0,
      "onCustomerServiceBtnClick",
      this.getClassName(),
    );

    // 设置游戏记录按钮点击事件
    this.setButtonClickEvent(
      "BottomBar/GameRecordBtn",
      0,
      "onGameRecordBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 绑定手机按钮点击事件
   * @param event
   */
  private onBindPhoneBtnClick(event: Event) {
    ComponentManager.Instance.renderUiNode<BindPhoneUI_Component>(
      "BindPhoneUI",
      "Prefabs",
      "Plaza/BindPhoneUI",
      BindPhoneUI_Component,
    );
  }

  /**
   * 商城按钮点击事件
   * @param event
   */
  private onShopBtnClick(event: Event) {
    CommonDailogHandler.showBubbleMessage("敬请期待");
  }

  /**
   * 活动按钮点击事件
   * @param event
   */
  private onActivityBtnClick(event: Event) {
    ComponentManager.Instance.renderUiNode<ActivityUI_Component>(
      "ActivityUI",
      "Prefabs",
      "Plaza/ActivityUI",
      ActivityUI_Component,
    );
  }

  /**
   * 加入游戏卡片按钮点击事件
   * @param event
   */
  private onJoinGameCardBtnClick(event: Event) {
    CommonDailogHandler.showDialogMiniKeyboard(
      "JoinRoomToggle",
      6,
      (value: string) => {
        console.log("房间ID--->", value);
        // TODO - 加入游戏
        console.log("加入游戏");
        CommonDailogHandler.showBubbleMessage(`房间不存在`);
      },
    );
  }

  /**
   * 创建房间卡片按钮点击事件
   * @param event
   */
  private onCreateGameCardBtnClick(event: Event) {
    const [node, component] =
      ComponentManager.Instance.renderUiNode<GameSettingUI_Component>(
        "GameSettnigUI",
        "Prefabs",
        "GameSetting/GameSettingUI",
        GameSettingUI_Component,
      );
    component.setData("PUBLIC", GlobalData.Instance.defaultDicesConfig);
  }

  /**
   * 俱乐部按钮点击事件
   * @param event
   */
  private onClubBtnClick(event: Event) {
    ComponentManager.Instance.renderUiNode<ClubMainUI_Component>(
      "ClubMainUI",
      "Prefabs",
      "Club/ClubMainUI",
      ClubMainUI_Component,
    );
  }

  /**
   * 设置按钮点击事件
   * @param event
   */
  private onSettingBtnClick(event: Event) {
    ComponentManager.Instance.renderUiNode<PlazaSettingUI_Component>(
      "PlazaSettingUI",
      "Prefabs",
      "Plaza/PlazaSettingUI",
      PlazaSettingUI_Component,
    );
  }

  /**
   * 分享按钮点击事件
   * @param event
   */
  private onShareBtnClick(event: Event) {
    ComponentManager.Instance.renderUiNode<ShareUI_Component>(
      "ShareUI",
      "Prefabs",
      "Plaza/ShareUI",
      ShareUI_Component,
    );
  }

  /**
   * 邀请按钮点击事件
   * @param event
   */
  private onInviteBtnClick(event: Event) {
    ComponentManager.Instance.renderUiNode<InviteUI_Component>(
      "InviteUI",
      "Prefabs",
      "Plaza/InviteUI",
      InviteUI_Component,
    );
  }

  /**
   * 客服按钮点击事件
   * @param event
   */
  private onCustomerServiceBtnClick(event: Event) {
    ComponentManager.Instance.renderUiNode<CustomerServiceUI_Component>(
      "CustomerServiceUI",
      "Prefabs",
      "Plaza/CustomerServiceUI",
      CustomerServiceUI_Component,
    );
  }

  /**
   * 游戏记录按钮点击事件
   * @param event
   */
  private onGameRecordBtnClick(event: Event) {
    const [node, component] =
      ComponentManager.Instance.renderUiNode<DicesGameRecordUI_Component>(
        "DicesGameRecordUI",
        "Prefabs",
        "Common/DicesGameRecordUI",
        DicesGameRecordUI_Component,
      );
    component.setShowMode("ALL");
  }

  /**
   * 渲染跑马灯信息
   * @param marqueeMsgs
   */
  public renderMarquees(marqueeMsgs: string[]) {
    this._informationMarqueeComponent.setMessages(marqueeMsgs);
  }

  /**
   * 渲染玩家信息
   */
  public renderPlayerInformation(player: Gateway.Returned.Player.Player) {
    // 设置状态栏玩家信息
    this._playerInfoComponent?.setPlayerInformation(player);

    //  设置编辑玩家信息界面
    const [playerInforEditUiNode, playerInfoEditUiComponent] =
      ComponentManager.Instance.getNodeComponent(
        "PlazaMainUI/PlazaPlayerInfoUI",
        PlayerInfoEditUI_Component,
      );
    playerInfoEditUiComponent?.setPlayerInformation(player);
  }
}
