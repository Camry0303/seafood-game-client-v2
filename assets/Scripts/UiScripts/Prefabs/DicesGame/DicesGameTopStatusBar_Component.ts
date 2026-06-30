import { _decorator, Event, Label, Node, sys, UITransform } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
import { GlobalData } from "../../../Runtime/GlobalData";
import { CLUB_PLAYER_ROLE, DICES_GAMING_STATUS } from "../../../Enums";
import moment from "moment";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { DicesGameHelpUI_Component } from "./DicesGameHelpUI_Component";
import { DicesGameSoundSettingUI_Component } from "./DicesGameSoundSettingUI_Component";
import { DicesGameDialogConfirmSmallUI_Component } from "./DicesGameDialogConfirmSmallUI_Component";
import { DicesGameOrderDetailsUI_Component } from "./DicesGameOrderDetailsUI_Component";
import { DicesGameHistoryUI_Component } from "./DicesGameHistoryUI_Component";
import sleep from "../../../Utils/Sleep";
import CryptoUtils from "../../../Utils/CryptoUtils";
import DicesGameEvents from "../../../Network/SocketIo/DicesGameEvents";
import { Gateway } from "../../../Types/typing";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameTopStatusBar_Component")
@menu("Hidden/DicesGameTopStatusBar_Component")
export class DicesGameTopStatusBar_Component extends ComponentController {
  // 骰子游戏主界面组件
  private _mainComponent: DicesGameMainUI_Component = null;

  // 更多选项菜单节点
  private _moreOptionsNode: Node = null;

  // 解散房间按钮节点
  private _dissolveBtnNode: Node = null;

  // 信号类型节点
  private _signalTypeNode: Node = null;

  // 时钟标签
  private _clockLabel: Label = null;

  // 电量节点原始宽度
  private _batteryOriginWidth: number = 0;
  // 电量蒙版ui
  private _batteryMaskUi: UITransform = null;

  // 房间ID标签
  private _roomIdLabel: Label = null;

  // 分数类型标签
  private _scoreModeLabel: Label = null;

  // 总局数
  private _totalRoundsLabel: Label = null;

  // 当前局数
  private _currentRoundLabel: Label = null;

  start() {
    // 设置时钟标签
    this.schedule(() => {
      this._clockLabel && (this._clockLabel.string = moment().format("HH:mm"));
    }, 1);

    if (sys.isNative) {
      // TODO - 设置电池电量获取任务

      // 设置获取信号类型任务
      if (sys.os === sys.OS.IOS) {
        // IOS不显示信号类型
        this._signalTypeNode.active = false;
      } else if (sys.os === sys.OS.ANDROID) {
        // TODO - 获取安卓信号类型
      }
    }

    console.log(`sys.os--->`, sys.os);
    console.log(`sys.isNative--->`, sys.isNative);
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取骰子游戏主界面组件
    this._mainComponent = this.node.parent.getComponent(
      DicesGameMainUI_Component,
    );

    // 设置更多菜单按钮点击事件
    this.setButtonClickEvent(
      "MoreOptionsBtn",
      0,
      "onMoreOptionsBtnClick",
      this.getClassName(),
    );

    // 获取更多选项菜单节点
    this._moreOptionsNode = this.getNode("MoreOptionsBtn/MoreOptions");

    // 设置帮助按钮点击事件
    this.setButtonClickEvent(
      "MoreOptionsBtn/MoreOptions/HelpBtn",
      0,
      "onHelpBtnClick",
      this.getClassName(),
    );

    // 设置声音设置按钮点击事件
    this.setButtonClickEvent(
      "MoreOptionsBtn/MoreOptions/SoundSettingBtn",
      0,
      "onSoundSettingBtnClick",
      this.getClassName(),
    );

    // 设置退出按钮点击事件
    this.setButtonClickEvent(
      "MoreOptionsBtn/MoreOptions/ExitBtn",
      0,
      "onExitBtnClick",
      this.getClassName(),
    );

    // 获取玩家角色
    const role = GlobalData.Instance.getCurrentClubPlayerInfo()?.role;
    // 按权限显示或隐藏解散房间按钮
    if (
      role === CLUB_PLAYER_ROLE.ADMIN ||
      role === CLUB_PLAYER_ROLE.SUB_ADMIN
    ) {
      [this._dissolveBtnNode] = this.setButtonClickEvent(
        "MoreOptionsBtn/MoreOptions/DissolveBtn",
        0,
        "onDissolveBtnClick",
        this.getClassName(),
      );
      this._dissolveBtnNode.active = true;
    }

    // 设置测试按钮点击事件
    this.setButtonClickEvent(
      "MoreOptionsBtn/MoreOptions/TestBtn",
      0,
      "onTestBtnClick",
      this.getClassName(),
    );

    // 获取信号类型节点
    this._signalTypeNode = this.getNode("StatusBar/Content/SignalType");

    // 获取时钟标签
    [, this._clockLabel] = this.getNodeComponent(
      "StatusBar/Content/Clock",
      Label,
    );

    // 获取电量节点原始宽度
    this._batteryOriginWidth = this.getNodeComponent(
      "StatusBar/Content/Battery/Mask",
      UITransform,
    )[1].width;

    // 获取电量蒙版ui
    [, this._batteryMaskUi] = this.getNodeComponent(
      "StatusBar/Content/Battery/Mask",
      UITransform,
    );

    // 获取房间ID标签
    [, this._roomIdLabel] = this.getNodeComponent(
      "StatusBar/Content/RoomId",
      Label,
    );

    // 获取分数类型标签
    [, this._scoreModeLabel] = this.getNodeComponent(
      "StatusBar/Content/ScoreMode",
      Label,
    );

    // 获取总局数标签
    [, this._totalRoundsLabel] = this.getNodeComponent(
      "StatusBar/Content/TotalRounds",
      Label,
    );

    // 获取当前局数标签
    [, this._currentRoundLabel] = this.getNodeComponent(
      "StatusBar/Content/CurrentRound",
      Label,
    );

    // 设置下单详情按钮点击事件
    this.setButtonClickEvent(
      "MenuPanel/GameOrderBtn",
      0,
      "onOrderDetailsBtnClick",
      this.getClassName(),
    );

    // 设置结果历史按钮点击事件
    this.setButtonClickEvent(
      "MenuPanel/ResultHistoryBtn",
      0,
      "onResultHistoryBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 更多菜单按钮点击事件
   * @param event
   */
  private onMoreOptionsBtnClick(event: Event) {
    console.log(`onMoreOptionsBtnClick--->`);
    this._moreOptionsNode.active = !this._moreOptionsNode.active;
  }

  /**
   * 帮助按钮点击事件
   * @param event
   */
  private onHelpBtnClick(event: Event) {
    console.log(`onHelpBtnClick--->`);
    ComponentManager.Instance.renderUiNode<DicesGameHelpUI_Component>(
      "DicesGameHelpUI",
      "Prefabs",
      "DicesGame/DicesGameHelpUI",
      DicesGameHelpUI_Component,
    );
  }

  /**
   * 声音设置按钮点击事件
   * @param event
   */
  private onSoundSettingBtnClick(event: Event) {
    console.log(`onSoundSettingBtnClick--->`);
    ComponentManager.Instance.renderUiNode<DicesGameSoundSettingUI_Component>(
      "DicesGameSoundSettingUI",
      "Prefabs",
      "DicesGame/DicesGameSoundSettingUI",
      DicesGameSoundSettingUI_Component,
    );
  }

  /**
   * 退出按钮点击事件
   * @param event
   */
  private onExitBtnClick(event: Event) {
    console.log(`onExitBtnClick--->`);
    const [node, component] =
      ComponentManager.Instance.renderUiNode<DicesGameDialogConfirmSmallUI_Component>(
        "DicesGameDialogConfirmSmallUI",
        "Prefabs",
        "DicesGame/DicesGameDialogConfirmSmallUI",
        DicesGameDialogConfirmSmallUI_Component,
      );
    component.setDialogConfirm(
      "ExitToggle",
      "确认退出房间",
      () => {
        // 退出房间逻辑
        DicesGameEvents.leaveClubDicesGameRoom();
      },
      () => {},
    );
  }

  /**
   * 解散房间按钮点击事件
   * @param event
   */
  private onDissolveBtnClick(event: Event) {
    console.log(`onDissolveBtnClick--->`);
    const [node, component] =
      ComponentManager.Instance.renderUiNode<DicesGameDialogConfirmSmallUI_Component>(
        "DicesGameDialogConfirmSmallUI",
        "Prefabs",
        "DicesGame/DicesGameDialogConfirmSmallUI",
        DicesGameDialogConfirmSmallUI_Component,
      );
    component.setDialogConfirm(
      "DissolveToggle",
      "确认解散房间",
      () => {
        // 解散房间逻辑
        DicesGameEvents.adminDissolveClubDicesGameRoom();
      },
      () => {},
    );
  }

  /**
   * 测试按钮点击事件
   * @param event
   */
  private onTestBtnClick(event: Event) {
    console.log(`onTestBtnClick--->`);
    // // FIXME: 暂时使用 测试倒计时
    // this._mainComponent
    //   .getGameTableComponent()
    //   .updateTimeCounterUI(DICES_GAMING_STATUS.PREPARATION, 3);

    // FIXME: 暂时使用 测试下单动画
    setTimeout(async () => {
      const times = 20;
      for (let i = 0; i < times; i++) {
        this._mainComponent
          .getGameTableComponent()
          .placeChipAnimation(
            CryptoUtils.genRandomIntegerBetween(1, 6),
            [5, 25, 50, 100, 500][
              CryptoUtils.genRandomIntegerBetween(0, 4)
            ],
            "0",
            12,
          );
        await sleep(500);
      }
    }, 3000);

    // // FIXME: 暂时使用 测试摇骰盅动画
    // this._mainComponent.getGameTableComponent().playShakeDiceCupAnimation();

    // // FIXME: 暂时使用 测试打开骰盅
    // this._mainComponent
    //   .getGameTableComponent()
    //   .playerOpenDiceCupAnimation([2, 4]);

    // // FIXME: 暂时使用 测试游戏状态动画
    // this._mainComponent
    //   .getGameStatusContainerComponent()
    //   .updateGamingStatusUI("START_ORDER");

    // // FIXME: 设置游戏开始
    // this._mainComponent.setGameStart(3, 2);

    // // // FIXME: 设置开始下单
    // this._mainComponent.setStartOrder(40);

    // // FIXME: 设置停止下单
    // this._mainComponent.setStopOrder(2);

    // // FIXME: 设置开骰结果
    // this._mainComponent.setOpenResults(9, [2, 4]);
  }

  /**
   * 下单详情按钮点击事件
   * @param event
   */
  private onOrderDetailsBtnClick(event: Event) {
    console.log(`onOrderDetailsBtnClick--->`);
    ComponentManager.Instance.renderUiNode<DicesGameOrderDetailsUI_Component>(
      "DicesGameOrderDetailsUI",
      "Prefabs",
      "DicesGame/DicesGameOrderDetailsUI",
      DicesGameOrderDetailsUI_Component,
    );
  }

  /**
   * 结果历史按钮点击事件
   * @param event
   */
  private onResultHistoryBtnClick(event: Event) {
    console.log(`onResultHistoryBtnClick--->`);
    ComponentManager.Instance.renderUiNode<DicesGameHistoryUI_Component>(
      "DicesGameHistoryUI_Component",
      "Prefabs",
      "DicesGame/DicesGameHistoryUI",
      DicesGameHistoryUI_Component,
    );
  }

  /**
   * 更新状态栏
   * @param current_round
   */
  public updateTopStatusBarUI(current_round: number) {
    const roomData =
      GlobalData.Instance.getCurrentGameInfo<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>()
        ?.game_room_data;

    this._roomIdLabel.string = `房间：${roomData?.room_id}`;
    this._scoreModeLabel.string = `${roomData?.game_config?.score_mode === 0 ? "不可负分" : "可负分"}`;
    this._totalRoundsLabel.string = `共${roomData?.game_config?.total_game_rounds}局`;
    this._currentRoundLabel.string = `第${current_round}局`;
  }
}
