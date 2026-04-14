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
const { ccclass, menu } = _decorator;

@ccclass("PlazaMainUI_Component")
@menu("Hidden/PlazaMainUI_Component")
export class PlazaMainUI_Component extends ComponentController {
  private _playerInfoNode: Node = null;
  private _playerInfoComponent: PlazaPlayerInfo_Component = null;

  private _informationMarqueeNode: Node = null;
  private _informationMarqueeComponent: InformationMarquee_Component = null;

  start() {
    // NOTE - 播放大厅音乐
    if (sys.isNative) {
      SoundsManager.Instance.playMusic("bgm_01");
    } else {
      this.scheduleOnce(() => {
        SoundsManager.Instance.playMusic("bgm_01");
      }, 1);
    }
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
}
