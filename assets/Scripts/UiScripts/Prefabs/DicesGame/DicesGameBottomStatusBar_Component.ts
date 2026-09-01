import { Logger } from "../../../Utils/Logger";
import {
  _decorator,
  Button,
  Event,
  Label,
  Node,
  Slider,
  Sprite,
  SpriteAtlas,
  Toggle,
  ToggleContainer,
  UITransform,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { GlobalData } from "../../../Runtime/GlobalData";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { DicesGameGameTable_Component } from "./DicesGameGameTable_Component";
import { min } from "lodash";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import DicesGameEvents from "../../../Network/SocketIo/DicesGameEvents";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameBottomStatusBar_Component")
@menu("Hidden/DicesGameBottomStatusBar_Component")
export class DicesGameBottomStatusBar_Component extends ComponentController {
  // 骰子游戏主界面组件
  private _mainComponent: DicesGameMainUI_Component = null;
  // 骰子游戏游戏桌组件
  private _gameTableComponent: DicesGameGameTable_Component = null;

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
  // 普通下单面板节点
  private _chipsOrderPanelNode: Node = null;
  // 当前筹码值
  private _currentChipsValue: number = 5;
  // 筹码ToggleContainer
  private _chipsToggleContainer: ToggleContainer = null;
  //#endregion

  //#region 滑动下单面板相关属性
  // 滑动下单面板节点
  private _sliderOrderPanelNode: Node = null;
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
  // 滑动下单选中结果
  private _sliderOrderSelectedResult: (number | null)[] = [];
  // 滑动下单分数
  private _sliderOrderScore: number = 0;
  // 滑动下单最大分数
  private _sliderOrderMaxScore: number = 0;
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
  // 调试结果
  private _debugResultSelectedResult: (number | null)[] = [];
  //#endregion

  // 下单类型
  private _orderType: "Normal" | "Move" | "Leopard" | "Combo" | "Debug" =
    "Normal";

  start() {
    this._gameTableComponent = this._mainComponent.getGameTableComponent?.();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._mainComponent = this.node.parent.getComponent(
      DicesGameMainUI_Component,
    );

    // 初始化玩家信息UI
    this.initPlayerUI();
    // 初始化普通下单面板
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
    Logger.log(`onAvatarClick`);
    // 请求进入调试
    DicesGameEvents.debugMode();
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

  //#region 普通下单面板相关方法
  /**
   * 初始化普通下单面板
   */
  private initChipsOrderPanel() {
    // 获取普通下单面板节点
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
  }

  /**
   * 挪按钮点击事件
   * @param event
   */
  private onMoveBtnClick(event: Event) {
    Logger.log(`onMoveBtnClick`);
    // 判断当前是否可以下单
    const canOrder = this._mainComponent.getCanOrder();
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
    Logger.log(`onLeopardBtnClick`);
    // 判断当前是否可以下单
    const canOrder = this._mainComponent.getCanOrder();
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
    Logger.log(`onComboBtnClick`);
    // 判断当前是否可以下单
    const canOrder = this._mainComponent.getCanOrder();
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

  /**
   * 显示普通下单面板
   */
  public showChipsOrderPanel() {
    this._chipsOrderPanelNode.active = true;
    this._sliderOrderPanelNode.active = false;
    this._debugResultPanelNode.active = false;
    // 设置下单类型
    this._orderType = "Normal";
    // 隐藏挪标记
    this._moveTagNode.active = false;
    // 游戏桌面关闭下单勾选面板
    this._gameTableComponent.hideOrderCheckBoxPanel();
  }
  //#endregion

  //#region 滑动下单面板相关方法
  /**
   * 初始化滑动下单面板
   */
  private initSilderOrderPanel() {
    // 获取滑动下单面板节点
    this._sliderOrderPanelNode = this.getNode("SliderOrderPanel");
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

    //  计算下单分数
    this._sliderOrderScore = parseInt(
      String(this._sliderOrderMaxScore * this._scoreSlider.progress),
    );
    // 设置下单分数标签
    this._orderScoreLabel.string = `分数：${this._sliderOrderScore}`;
  }

  /**
   * 减少分数按钮点击事件
   * @param event
   */
  private onSubScoreBtnClick(event: Event) {
    Logger.log(`onSubScoreBtnClick`);
    if (this._sliderOrderMaxScore <= 0) {
      return;
    }
    this._sliderOrderScore--;
    this._scoreSlider.progress =
      this._sliderOrderScore / this._sliderOrderMaxScore;

    this._scoreSliderMaskUi.width =
      this._originWidth * this._scoreSlider.progress;
    // 设置下单分数标签
    this._orderScoreLabel.string = `分数：${this._sliderOrderScore}`;
  }

  /**
   * 增加分数按钮点击事件
   * @param event
   */
  private onAddScoreBtnClick(event: Event) {
    Logger.log(`onAddScoreBtnClick`);
    if (this._sliderOrderScore + 1 > this._sliderOrderMaxScore) {
      return;
    }
    this._sliderOrderScore++;
    this._scoreSlider.progress =
      this._sliderOrderScore / this._sliderOrderMaxScore;

    this._scoreSliderMaskUi.width =
      this._originWidth * this._scoreSlider.progress;
    // 设置下单分数标签
    this._orderScoreLabel.string = `分数：${this._sliderOrderScore}`;
  }

  /**
   * 确定按钮点击事件
   * @param event
   */
  private onSliderOrderPanelConfirmBtnClick(event: Event) {
    Logger.log(`onSliderOrderPanelConfirmBtnClick--->`);

    if (this._sliderOrderSelectedResult.some((item) => item === null)) {
      CommonDailogHandler.showBubbleMessage(`请选择图案`);
      return;
    }
    if (this._sliderOrderScore === 0) {
      CommonDailogHandler.showBubbleMessage(`请选择分数`);
      return;
    }

    // 发送下单请求
    let resultsString = "";
    // 创建下单参数
    const params = {
      order_type: undefined,
      order_results: undefined,
      order_score: undefined,
    };
    if (this._orderType === "Move") {
      resultsString = this._sliderOrderSelectedResult.join(",");
      params.order_type = 4;
    } else if (this._orderType === "Leopard") {
      resultsString = String(this._sliderOrderSelectedResult[0]);
      params.order_type = 3;
    } else if (this._orderType === "Combo") {
      resultsString = [...this._sliderOrderSelectedResult]
        .sort((a, b) => a - b)
        .join(",");
      params.order_type = 2;
    }
    params.order_results = resultsString;
    params.order_score = this._sliderOrderScore;

    // 发送下单请求
    DicesGameEvents.createOrder(params);
    // 切换成普通下单
    this.showChipsOrderPanel();
  }

  /**
   * 滑动下单面板关闭按钮点击事件
   * @param event
   */
  private onSliderOrderPanelCloseBtnClick(event: Event) {
    Logger.log(`onSliderOrderPanelCloseBtnClick`);
    // 显示普通下单面板
    this.showChipsOrderPanel();
  }

  /**
   * 显示滑动下单面板
   * @param orderType
   */
  public showSliderOrderPanel(orderType: "Move" | "Leopard" | "Combo") {
    // 关闭普通下单面板
    this._chipsOrderPanelNode.active = false;
    // 打开滑动下单面板
    this._sliderOrderPanelNode.active = true;
    // 关闭调试结果面板
    this._debugResultPanelNode.active = false;

    // 设置下单类型
    this._orderType = orderType;
    const orderTypeLabel =
      orderType === "Move" ? "挪" : orderType === "Leopard" ? "豹子" : "连串";
    // 设置下单类型标签
    this._orderTypeLabel.string = orderTypeLabel;
    // 设置下单分数标签
    this._orderScoreLabel.string = `分数：0`;
    // 显示挪标记
    this._moveTagNode.active = orderType === "Move";

    // 游戏桌面显示下单勾选面板
    this._gameTableComponent.showOrderCheckBoxPanel(orderType);

    // 清空选中结果
    this._sliderOrderSelectedResult = [null, null];
    // 清空滑动下单分数
    this._sliderOrderScore = 0;
    // 清空滑动下单最大分数
    this._sliderOrderMaxScore = 0;
    // 清空结果精灵
    this._result1Sprite.spriteFrame = null;
    this._result2Sprite.spriteFrame = null;

    // 初始化分数滑动条
    this._scoreSlider.progress = 0;
    this._scoreSliderMaskUi.width = 0;

    // 设置是否可滑动状态
    this._scoreSlider.enabled = false;
    // 设置加减按钮是否可点击状态
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
      "DebugResultPanel/ResultPanel/Content/ResetBtn",
      0,
      "onDebugResultPanelResetBtnClick",
      this.getClassName(),
    );
    // 获取调试结果1精灵
    [, this._debugResult1Sprite] = this.getNodeComponent(
      "DebugResultPanel/ResultPanel/Content/Result1/Icon",
      Sprite,
    );
    // 获取调试结果2精灵
    [, this._debugResult2Sprite] = this.getNodeComponent(
      "DebugResultPanel/ResultPanel/Content/Result2/Icon",
      Sprite,
    );
    // 获取调试结果3精灵
    [, this._debugResult3Sprite] = this.getNodeComponent(
      "DebugResultPanel/ResultPanel/Content/Result3/Icon",
      Sprite,
    );
    // 设置调试结果面板确定按钮点击事件
    this.setButtonClickEvent(
      "DebugResultPanel/ResultPanel/Content/ConfirmBtn",
      0,
      "onDebugResultPanelConfirmBtnClick",
      this.getClassName(),
    );
    // 设置调试结果面板关闭按钮点击事件
    this.setButtonClickEvent(
      "DebugResultPanel/RightMenu/Content/CloseBtn",
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
    Logger.log(`onDebugResultPanelResetBtnClick`);
    this.setDebugResultSelectedResult([null, null]);
    this._gameTableComponent.resetOrderCheckBoxPanel();
  }

  /**
   * 调试结果面板确定按钮点击事件
   * @param event
   */
  private onDebugResultPanelConfirmBtnClick(event: Event) {
    Logger.log(`onDebugResultPanelConfirmBtnClick--->`);

    if (this._debugResultSelectedResult.some((item) => item === null)) {
      CommonDailogHandler.showBubbleMessage(`请选择图案`);
      return;
    }

    const params = {
      results: this._debugResultSelectedResult.join(","),
    };
    // 发送调试请求
    DicesGameEvents.setDebugResult(params);
    // 切换成普通下单
    this.showChipsOrderPanel();
  }

  /**
   * 调试结果面板关闭按钮点击事件
   * @param event
   */
  private onDebugResultPanelCloseBtnClick(event: Event) {
    Logger.log(`onDebugResultPanelCloseBtnClick`);
    // 显示普通下单面板
    this.showChipsOrderPanel();
  }

  /**
   * 显示调试结果面板
   */
  public showDebugResultPanel() {
    // 关闭普通下单面板
    this._chipsOrderPanelNode.active = false;
    // 关闭滑动下单面板
    this._sliderOrderPanelNode.active = false;
    // 打开调试结果面板
    this._debugResultPanelNode.active = true;

    // 设置下单类型
    this._orderType = "Debug";
    // 设置勾选结果
    this._gameTableComponent.showOrderCheckBoxPanel("Debug");

    // 清空选中调试结果
    this._debugResultSelectedResult = [null, null];

    // 清空调试结果精灵
    this._debugResult1Sprite.spriteFrame = null;
    this._debugResult2Sprite.spriteFrame = null;

    this._debugResult3Sprite.spriteFrame = null;
    this._debugResult3Sprite.node.active = false;
  }

  //#endregion

  /**
   * 获取下单类型
   * @returns
   */
  public getOrderType() {
    return this._orderType;
  }

  /**
   * 获取滑动下单选中结果
   * @returns
   */
  public getSilderOrderSelectedResult() {
    return this._sliderOrderSelectedResult;
  }

  /**
   * 设置滑动下单选中结果
   * @param results
   */
  public setSilderOrderSelectedResult(results: (number | null)[]) {
    this._sliderOrderSelectedResult = results;

    // 设置结果图片精灵
    const atlas = ResourceManager.Instance.getAsset<SpriteAtlas>(
      "Images",
      `DicesGame/icons/small_icon0_atlas`,
    );
    if (results[0] !== null) {
      this._result1Sprite.spriteFrame = atlas.getSpriteFrame(`${results[0]}`);
    } else {
      this._result1Sprite.spriteFrame = null;
    }

    if (results[1] !== null) {
      this._result2Sprite.spriteFrame = atlas.getSpriteFrame(`${results[1]}`);
    } else {
      this._result2Sprite.spriteFrame = null;
    }

    // 清空滑动下单分数
    this._sliderOrderScore = 0;
    // 初始化分数滑动条
    this._scoreSlider.progress = 0;
    this._scoreSliderMaskUi.width = 0;
    this._orderScoreLabel.string = `分数：${0}`;

    // 计算可滑动分数
    // 判断下单类型
    if (this._orderType === "Move") {
      // 挪
      const moveResult = results[0];
      const moveTargetResult = results[1];

      // 可挪分数
      const toMoveScore =
        this._gameTableComponent?.getScoreBoardStatsData?.()
          .current_single_order_stats?.[moveResult - 1] ?? 0;
      // 可挪目标分数限制
      const toMoveTargetScoreLimit =
        (Number(
          GlobalData.Instance.getCurrentGameInfo()?.game_room_data?.game_config?.score_limit?.split(
            ",",
          )?.[0],
        ) ?? 0) -
        (this._gameTableComponent?.getScoreBoardStatsData?.()
          .current_single_order_stats?.[moveTargetResult - 1] ?? 0);
      // 玩家分数
      const playerScore = Math.floor(
        (GlobalData.Instance.getCurrentClubPlayerInfo()?.club_score ?? 0) / 5,
      );

      // 取最小值
      this._sliderOrderMaxScore = Math.min(
        toMoveScore,
        isNaN(toMoveTargetScoreLimit) ? 0 : toMoveTargetScoreLimit,
        playerScore,
      );
    } else if (this._orderType === "Leopard") {
      // 豹子
      const leopardResult = results[0];

      // 可豹子分数限制
      const toLeopardScoreLimit =
        (Number(
          GlobalData.Instance.getCurrentGameInfo()?.game_room_data?.game_config?.score_limit?.split(
            ",",
          )?.[2],
        ) ?? 0) -
        (this._gameTableComponent?.getScoreBoardStatsData?.()
          .current_leopard_order_stats?.[leopardResult - 1] ?? 0);
      // 玩家分数
      const playerScore =
        GlobalData.Instance.getCurrentClubPlayerInfo()?.club_score ?? 0;

      // 取最小值
      this._sliderOrderMaxScore = Math.min(
        isNaN(toLeopardScoreLimit) ? 0 : toLeopardScoreLimit,
        playerScore,
      );
    } else if (this._orderType === "Combo") {
      // 连串
      const resultKey = [...results].sort((a, b) => a - b).join(",");

      // 可连串分数限制
      const toComboScoreLimit =
        (Number(
          GlobalData.Instance.getCurrentGameInfo()?.game_room_data?.game_config?.score_limit?.split(
            ",",
          )?.[1],
        ) ?? 0) -
        (this._gameTableComponent?.getScoreBoardStatsData?.()
          .current_combo_order_stats?.[resultKey] ?? 0);
      // 玩家分数
      const playerScore =
        GlobalData.Instance.getCurrentClubPlayerInfo()?.club_score ?? 0;

      // 取最小值
      this._sliderOrderMaxScore = Math.min(
        isNaN(toComboScoreLimit) ? 0 : toComboScoreLimit,
        playerScore,
      );
    }

    this._scoreSlider.enabled = this._sliderOrderMaxScore > 0;
    this._addScoreBtn.interactable = this._sliderOrderMaxScore > 0;
    this._subScoreBtn.interactable = this._sliderOrderMaxScore > 0;
  }

  /**
   * 获取调试选中结果
   * @returns
   */
  public getDebugResultSelectedResult() {
    return this._debugResultSelectedResult;
  }

  /**
   * 设置调试选中结果
   * @param results
   */
  public setDebugResultSelectedResult(results: (number | null)[]) {
    this._debugResultSelectedResult = results;

    // 设置结果图片精灵
    const atlas = ResourceManager.Instance.getAsset<SpriteAtlas>(
      "Images",
      `DicesGame/icons/small_icon0_atlas`,
    );
    if (results[0] !== null) {
      this._debugResult1Sprite.spriteFrame = atlas.getSpriteFrame(
        `${results[0]}`,
      );
    } else {
      this._debugResult1Sprite.spriteFrame = null;
    }

    if (results[1] !== null) {
      this._debugResult2Sprite.spriteFrame = atlas.getSpriteFrame(
        `${results[1]}`,
      );
    } else {
      this._debugResult2Sprite.spriteFrame = null;
    }
  }
}
