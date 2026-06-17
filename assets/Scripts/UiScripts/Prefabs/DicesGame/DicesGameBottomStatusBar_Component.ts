import {
  _decorator,
  Button,
  Event,
  Label,
  Node,
  Slider,
  Sprite,
  Toggle,
  ToggleContainer,
  UITransform,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { GlobalData } from "../../../Runtime/GlobalData";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/typing";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameBottomStatusBar_Component")
@menu("Hidden/DicesGameBottomStatusBar_Component")
export class DicesGameBottomStatusBar_Component extends ComponentController {
  // 骰子游戏主界面组件
  private _mainComponent: DicesGameMainUI_Component = null;

  //#region 玩家信息UI相关属性
  // 玩家头像精灵
  private _avatarSprite: Sprite = null;
  // 玩家昵称标签
  private _nicknameLabel: Label = null;
  // 玩家ID标签
  private _playerIdLabel: Label = null;
  // 是否庄家标志节点
  private _dealerMarkNode: Node = null;
  //#endregion

  //#region 普通下单面板相关属性
  // 下单面板节点
  private _chipsOrderPanelNode: Node = null;
  // 当前筹码值
  private _currentChipsValue: number = 5;
  // 筹码ToggleContainer
  private _chipsToggleContainer: ToggleContainer = null;
  //#endregion

  //#region 滑动下单面板相关属性
  // 滑动下单面板节点
  private _silderOrderPanelNode: Node = null;
  // 下单类型标签
  private _orderTypeLabel: Label = null;
  // 下单分数标签
  private _orderScoreLabel: Label = null;
  // 分数滑动条
  private _scoreSlider: Slider = null;
  // 分数滑动条蒙版
  private _scoreSliderMaskUi: UITransform = null;
  // 分数滑动条长度
  private _originWidth: number = 0;
  // 加分按钮
  private _addScoreBtn: Button = null;
  // 减分按钮
  private _subScoreBtn: Button = null;
  // 结果1精灵
  private _result1Sprite: Sprite = null;
  // 结果2精灵
  private _result2Sprite: Sprite = null;
  // 结果3精灵
  private _result3Sprite: Sprite = null;
  // 挪标记节点
  private _moveTagNode: Node = null;
  //#endregion

  //#region 调试结果面板相关属性
  // 调试面板节点
  private _debugResultPanelNode: Node = null;
  // 调试结果1精灵
  private _debugResult1Sprite: Sprite = null;
  // 调试结果2精灵
  private _debugResult2Sprite: Sprite = null;
  // 调试结果3精灵
  private _debugResult3Sprite: Sprite = null;
  //#endregion

  // 下单类型
  private _orderType: "Normal" | "Move" | "Leopard" | "Combo" | "Debug" =
    "Normal";

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._mainComponent = this.node.parent.getComponent(
      DicesGameMainUI_Component,
    );

    console.log(
      `DicesGameBottomStatusBar_Component _mainComponent--->`,
      this._mainComponent,
    );

    // 初始化玩家信息UI
    this.initPlayerUI();
    // 初始化下单面板
    this.initChipsOrderPanel();
    // 初始化滑动下单面板
    this.initSilderOrderPanel();
    // 初始化调试结果面板
    this.initDebugResultPanel();
  }

  //#region 玩家信息UI相关方法
  /**
   * 初始化玩家信息UI
   */
  private initPlayerUI() {
    // 获取玩家头像精灵
    [, this._avatarSprite] = this.getNodeComponent(
      "PlayerUI/Avatar/Mask/AvatarSprite",
      Sprite,
    );
    // 获取玩家昵称标签
    [, this._nicknameLabel] = this.getNodeComponent(
      "PlayerUI/BaseInfo/NickNameLabel",
      Label,
    );
    // 获取玩家ID标签
    [, this._playerIdLabel] = this.getNodeComponent(
      "PlayerUI/BaseInfo/IdLabel",
      Label,
    );
    // 获取是否庄家标志节点
    this._dealerMarkNode = this.getNode("PlayerUI/IsDealer");

    // 点击头像按钮点击事件
    this.setButtonClickEvent(
      "PlayerUI/Avatar",
      0,
      "onAvatarClick",
      this.getClassName(),
    );
  }

  /**
   * 头像按钮点击事件
   * @param event
   */
  private onAvatarClick(event: Event) {
    console.log(`onAvatarClick`);
  }

  /**
   *  更新玩家信息UI
   */
  public async updatePlayerUI(dealer_id: number | null) {
    const playerData = GlobalData.Instance.getCurrentPlayerInfo();
    this._nicknameLabel.string = playerData.nickname;
    this._playerIdLabel.string = `ID：${playerData.id}`;
    this._dealerMarkNode.active = playerData.id === dealer_id;

    this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(
      playerData.avatar,
    );
  }
  //#endregion

  //#region 下单面板相关方法
  /**
   * 初始化下单面板
   */
  private initChipsOrderPanel() {
    // 获取下单面板节点
    this._chipsOrderPanelNode = this.getNode("ChipsOrderPanel");
    // 设置筹码ToggleContainer选中事件
    [, this._chipsToggleContainer] = this.setToggleContainerCheckEvent(
      "ChipsOrderPanel/ChipsPanel/Content",
      0,
      "onChipsToggleCheck",
      this.getClassName(),
    );
    // 设置挪按钮点击事件
    this.setButtonClickEvent(
      "ChipsOrderPanel/OrderTypePanel/Content/MoveBtn",
      0,
      "onMoveBtnClick",
      this.getClassName(),
    );
    // 设置豹子按钮点击事件
    this.setButtonClickEvent(
      "ChipsOrderPanel/OrderTypePanel/Content/LeopardBtn",
      0,
      "onLeopardBtnClick",
      this.getClassName(),
    );
    // 设置连串按钮点击事件
    this.setButtonClickEvent(
      "ChipsOrderPanel/OrderTypePanel/Content/ComboBtn",
      0,
      "onComboBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 筹码ToggleContainer选中事件
   * @param event
   */
  private onChipsToggleCheck(event: Event) {
    const toggleNode = event.target as Node;
    const toggle = event as unknown as Toggle;
    this._currentChipsValue = Number(toggleNode.name);

    console.log("onChipsToggleCheck toggleNode--->", toggleNode);
    console.log("onChipsToggleCheck toggle--->", toggle);
    console.log(
      `onChipsToggleCheck currentChipsValue--->`,
      this._currentChipsValue,
    );
  }

  /**
   * 挪按钮点击事件
   * @param event
   */
  private onMoveBtnClick(event: Event) {
    console.log(`onMoveBtnClick`);
    // TODO - 判断当前是否可以下单
    const canOrder = true;
    if (!canOrder) {
      CommonDailogHandler.showBubbleMessage(`当前不可下注`);
      return;
    }
    this.showSliderOrderPanel("Move");
  }

  /**
   * 豹子按钮点击事件
   * @param event
   */
  private onLeopardBtnClick(event: Event) {
    console.log(`onLeopardBtnClick`);
    // TODO - 判断当前是否可以下单
    const canOrder = true;
    if (!canOrder) {
      CommonDailogHandler.showBubbleMessage(`当前不可下注`);
      return;
    }
    this.showSliderOrderPanel("Leopard");
  }

  /**
   * 连串按钮点击事件
   * @param event
   */
  private onComboBtnClick(event: Event) {
    console.log(`onComboBtnClick`);
    // TODO - 判断当前是否可以下单
    const canOrder = true;
    if (!canOrder) {
      CommonDailogHandler.showBubbleMessage(`当前不可下注`);
      return;
    }
    this.showSliderOrderPanel("Combo");
  }

  /**
   * 获取当前选中筹码值
   * @returns
   */
  public getCurrentChipsValue() {
    return this._currentChipsValue;
  }
  //#endregion

  //#region 滑动下单面板相关方法
  /**
   * 初始化滑动下单面板
   */
  private initSilderOrderPanel() {
    // 获取滑动下单面板节点
    this._silderOrderPanelNode = this.getNode("SliderOrderPanel");
    // 获取下单类型标签
    [, this._orderTypeLabel] = this.getNodeComponent(
      "SliderOrderPanel/SliderPanel/SliderStatusPanel/Content/OrderTypeLabel",
      Label,
    );
    // 获取下单分数标签
    [, this._orderScoreLabel] = this.getNodeComponent(
      "SliderOrderPanel/SliderPanel/SliderStatusPanel/Content/OrderScoreLabel",
      Label,
    );
    // 获取分数滑动条
    [, this._scoreSlider] = this.getNodeComponent(
      "SliderOrderPanel/SliderPanel/Content/ScoreSlider",
      Slider,
    );
    // 获取分数滑动条蒙版
    [, this._scoreSliderMaskUi] = this.getNodeComponent(
      "SliderOrderPanel/SliderPanel/Content/ScoreSlider/Mask",
      UITransform,
    );
    // 获取分数滑动条原始宽度
    this._originWidth = this.getNodeComponent(
      "SliderOrderPanel/SliderPanel/Content/ScoreSlider",
      UITransform,
    )[1].width;
    // 设置分数滑动条滑动事件
    this.setSlideEvent(
      "SliderOrderPanel/SliderPanel/Content/ScoreSlider",
      0,
      "onScoreSliderChange",
      this.getClassName(),
    );
    // 设置减少分数按钮点击事件
    [, this._subScoreBtn] = this.setButtonClickEvent(
      "SliderOrderPanel/SliderPanel/Content/SubScoreBtn",
      0,
      "onSubScoreBtnClick",
      this.getClassName(),
    );
    // 设置增加分数按钮点击事件
    [, this._addScoreBtn] = this.setButtonClickEvent(
      "SliderOrderPanel/SliderPanel/Content/AddScoreBtn",
      0,
      "onAddScoreBtnClick",
      this.getClassName(),
    );
    // 设置确定按钮点击事件
    this.setButtonClickEvent(
      "SliderOrderPanel/RightMenu/Content/ConfirmBtn",
      0,
      "onSliderOrderPanelConfirmBtnClick",
      this.getClassName(),
    );
    // 获取结果1精灵
    [, this._result1Sprite] = this.getNodeComponent(
      "SliderOrderPanel/RightMenu/Content/Result1/Icon",
      Sprite,
    );
    // 获取结果2精灵
    [, this._result2Sprite] = this.getNodeComponent(
      "SliderOrderPanel/RightMenu/Content/Result2/Icon",
      Sprite,
    );
    // 获取结果3精灵
    [, this._result3Sprite] = this.getNodeComponent(
      "SliderOrderPanel/RightMenu/Content/Result3/Icon",
      Sprite,
    );
    // 获取挪标记节点
    this._moveTagNode = this.getNode(
      "SliderOrderPanel/RightMenu/Content/MoveTag",
    );
    // 设置滑动下单面板关闭按钮点击事件
    this.setButtonClickEvent(
      "SliderOrderPanel/LeftMenu/CloseBtn",
      0,
      "onSliderOrderPanelCloseBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 分数滑动条滑动事件
   * @param event
   */
  private onScoreSliderChange(event: Event) {
    this._scoreSliderMaskUi.width =
      this._originWidth * this._scoreSlider.progress;
    // TODO - 计算下单分数
    console.log(`onScoreSliderChange--->`, this._scoreSlider.progress);
  }

  /**
   * 减少分数按钮点击事件
   * @param event
   */
  private onSubScoreBtnClick(event: Event) {
    console.log(`onSubScoreBtnClick`);
  }

  /**
   * 增加分数按钮点击事件
   * @param event
   */
  private onAddScoreBtnClick(event: Event) {
    console.log(`onAddScoreBtnClick`);
  }

  /**
   * 确定按钮点击事件
   * @param event
   */
  private onSliderOrderPanelConfirmBtnClick(event: Event) {
    console.log(`onSliderOrderPanelConfirmBtnClick`);
  }

  /**
   * 滑动下单面板关闭按钮点击事件
   * @param event
   */
  private onSliderOrderPanelCloseBtnClick(event: Event) {
    console.log(`onSliderOrderPanelCloseBtnClick`);
    this._silderOrderPanelNode.active = false;
    this._moveTagNode.active = false;
    this._orderType = "Normal";
    this._chipsOrderPanelNode.active = true;
  }

  /**
   * 显示滑动下单面板
   * @param orderType
   */
  private showSliderOrderPanel(orderType: "Move" | "Leopard" | "Combo") {
    // 设置下单类型
    this._orderType = orderType;
    const orderTypeLabel =
      orderType === "Move" ? "挪" : orderType === "Leopard" ? "豹子" : "连串";
    // 关闭下单面板
    this._chipsOrderPanelNode.active = false;
    // 打开滑动下单面板
    this._silderOrderPanelNode.active = true;
    // 设置下单类型标签
    this._orderTypeLabel.string = orderTypeLabel;
    // 设置下单分数标签
    this._orderScoreLabel.string = `分数：0`;
    // 显示挪标记
    this._moveTagNode.active = orderType === "Move";
    // 初始化分数滑动条
    this._scoreSlider.progress = 0;
    this._scoreSliderMaskUi.width = 0;
    // 设置为不可滑动状态
    this._scoreSlider.enabled = false;
    // 设置加减按钮不可点击状态
    this._addScoreBtn.interactable = false;
    this._subScoreBtn.interactable = false;
  }
  //#endregion

  //#region 调试结果面板相关方法
  /**
   * 初始化调试结果面板
   */
  private initDebugResultPanel() {
    // 获取调试结果面板节点
    this._debugResultPanelNode = this.getNode("DebugResultPanel");
    // 设置调试结果面板重置按钮点击事件
    this.setButtonClickEvent(
      "DebugResultrPanel/ResultPanel/Content/ResetBtn",
      0,
      "onDebugResultPanelResetBtnClick",
      this.getClassName(),
    );
    // 获取调试结果1精灵
    [, this._debugResult1Sprite] = this.getNodeComponent(
      "DebugResultrPanel/ResultPanel/Content/Result1/Icon",
      Sprite,
    );
    // 获取调试结果2精灵
    [, this._debugResult2Sprite] = this.getNodeComponent(
      "DebugResultrPanel/ResultPanel/Content/Result2/Icon",
      Sprite,
    );
    // 获取调试结果3精灵
    [, this._debugResult3Sprite] = this.getNodeComponent(
      "DebugResultrPanel/ResultPanel/Content/Result3/Icon",
      Sprite,
    );
    // 设置调试结果面板确定按钮点击事件
    this.setButtonClickEvent(
      "DebugResultrPanel/ResultPanel/Content/ConfirmBtn",
      0,
      "onDebugResultPanelConfirmBtnClick",
      this.getClassName(),
    );
    // 设置调试结果面板关闭按钮点击事件
    this.setButtonClickEvent(
      "DebugResultrPanel/RightMenu/Content/CloseBtn",
      0,
      "onDebugResultPanelCloseBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 调试结果面板重置按钮点击事件
   * @param event
   */
  private onDebugResultPanelResetBtnClick(event: Event) {
    console.log(`onDebugResultPanelResetBtnClick`);
  }

  /**
   * 调试结果面板确定按钮点击事件
   * @param event
   */
  private onDebugResultPanelConfirmBtnClick(event: Event) {
    console.log(`onDebugResultPanelConfirmBtnClick`);
  }

  /**
   * 调试结果面板关闭按钮点击事件
   * @param event
   */
  private onDebugResultPanelCloseBtnClick(event: Event) {
    console.log(`onDebugResultPanelCloseBtnClick`);
  }
  //#endregion

  /**
   * 获取下单类型
   * @returns
   */
  public getOrderType() {
    return this._orderType;
  }
}
