import { _decorator, Event, Node, Slider, UITransform } from "cc";
import { Logger } from "../../../Utils/Logger";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { SoundsManager } from "../../../Runtime/SoundsManager";
import { LoginRegisterMainUI_Component } from "../LoginRegister/LoginRegisterMainUI_Component";
import SocketManager from "../../../Network/SocketIo/SocketManager";
import { GlobalData } from "../../../Runtime/GlobalData";
const { ccclass, menu } = _decorator;

@ccclass("DialogSettingUI_Component")
@menu("Hidden/DialogSettingUI_Component")
export class DialogSettingUI_Component extends ComponentController {
  public bubbleWindow: BubbleWindow = null;

  private _bgmSliderNode: Node = null;
  private _bgmSlider: Slider = null;

  private _effectNode: Node = null;
  private _effectSlider: Slider = null;

  private _bgmSliderMaskNode: Node = null;
  private _bgmSliderMaskUi: UITransform = null;

  private _effectSliderMaskNode: Node = null;
  private _effectSliderMaskUi: UITransform = null;

  private _originWidth: number = 0;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this.bubbleWindow = this.node.addComponent(BubbleWindow);

    this._originWidth = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/SoundSettingPanel/Content/BGM/Slider",
      UITransform,
    )[1].width;

    const [bgmSliderNode, bgmSlider] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/SoundSettingPanel/Content/BGM/Slider",
      Slider,
    );
    this._bgmSliderNode = bgmSliderNode;
    this._bgmSlider = bgmSlider;

    const [effectNode, effectSlider] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/SoundSettingPanel/Content/Effect/Slider",
      Slider,
    );
    this._effectNode = effectNode;
    this._effectSlider = effectSlider;

    const [bgmSliderMaskNode, bgmSliderMaskUi] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/SoundSettingPanel/Content/BGM/Slider/Mask",
      UITransform,
    );
    this._bgmSliderMaskNode = bgmSliderMaskNode;
    this._bgmSliderMaskUi = bgmSliderMaskUi;

    const [effectSliderMaskNode, effectSliderMaskUi] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/SoundSettingPanel/Content/Effect/Slider/Mask",
      UITransform,
    );
    this._effectSliderMaskNode = effectSliderMaskNode;
    this._effectSliderMaskUi = effectSliderMaskUi;

    // 设置切换账号按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ButtonPanel/LogoutBtn",
      0,
      "onLogoutBtnClick",
      this.getClassName(),
    );

    // 设置BGM滑动条滑动事件
    this.setSlideEvent(
      "MainView/Content/ScrollView/view/content/SoundSettingPanel/Content/BGM/Slider",
      0,
      "onBgmSliderChange",
      this.getClassName(),
    );

    // 设置音效滑动条滑动事件
    this.setSlideEvent(
      "MainView/Content/ScrollView/view/content/SoundSettingPanel/Content/Effect/Slider",
      0,
      "onEffectSliderChange",
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

    this.initDialogSettingUI();
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
   * 初始化设置面板
   */
  public initDialogSettingUI() {
    const bgmVolume = SoundsManager.Instance.getBgmVolume();
    this._bgmSlider.progress = bgmVolume;
    this._bgmSliderMaskUi.width = this._originWidth * this._bgmSlider.progress;

    const effectVolume = SoundsManager.Instance.getEffectVolume();
    this._effectSlider.progress = effectVolume;
    this._effectSliderMaskUi.width =
      this._originWidth * this._effectSlider.progress;
  }

  /**
   * BGM滑动条事件
   * @param event
   */
  private onBgmSliderChange(event: Event) {
    this._bgmSliderMaskUi.width = this._originWidth * this._bgmSlider.progress;
    SoundsManager.Instance.setBgmVolume(this._bgmSlider.progress);
  }

  /**
   * 音效滑动条事件
   * @param event
   */
  private onEffectSliderChange(event: Event) {
    this._effectSliderMaskUi.width =
      this._originWidth * this._effectSlider.progress;
    SoundsManager.Instance.setEffectVolume(this._effectSlider.progress);
  }

  /**
   * 退出登陆按钮事件
   * @param event
   */
  private onLogoutBtnClick(event: Event) {
    Logger.log(`onLogoutBtnClick--->`);
    // 挂载登录注册界面
    ComponentManager.Instance.renderUiNode<LoginRegisterMainUI_Component>(
      "LoginRegisterMainUI",
      "Prefabs",
      "LoginRegister/LoginRegisterMainUI",
      LoginRegisterMainUI_Component,
    );

    // 销毁大厅场景界面
    ComponentManager.Instance.destroyNodeByName("PlazaMainUI");

    // 清除token
    ComponentManager.Instance.deleteDataFromStorage("token");

    // 断开socket连接
    SocketManager.Instance.disconnect();

    // 清理当前登录玩家信息
    GlobalData.Instance.setCurrentPlayerInfo(null);
    GlobalData.Instance.setCurrentClubInfoDetail(null);
    GlobalData.Instance.setCurrentClubPlayerInfo(null);
    GlobalData.Instance.setCurrentGameInfo(null);
    this.close();
  }
}
