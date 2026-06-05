import { _decorator, Event, Label, Node, Slider, sys, UITransform } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
import { GlobalData } from "../../../Runtime/GlobalData";
import { CLUB_PLAYER_ROLE } from "../../../Enums";
import moment from "moment";
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
  private _scoreTypeLabel: Label = null;

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
      // TODO: 设置电池电量获取任务

      // 设置获取信号类型任务
      if (sys.os === sys.OS.IOS) {
        // TODO: 获取信号类型
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
    [, this._scoreTypeLabel] = this.getNodeComponent(
      "StatusBar/Content/ScoreType",
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
      "onOrderDetailBtnClick",
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
  }

  /**
   * 声音设置按钮点击事件
   * @param event
   */
  private onSoundSettingBtnClick(event: Event) {
    console.log(`onSoundSettingBtnClick--->`);
  }

  /**
   * 退出按钮点击事件
   * @param event
   */
  private onExitBtnClick(event: Event) {
    console.log(`onExitBtnClick--->`);
  }

  /**
   * 解散房间按钮点击事件
   * @param event
   */
  private onDissolveBtnClick(event: Event) {
    console.log(`onDissolveBtnClick--->`);
  }

  /**
   * 下单详情按钮点击事件
   * @param event
   */
  private onOrderDetailBtnClick(event: Event) {
    console.log(`onOrderDetailBtnClick--->`);
  }

  /**
   * 结果历史按钮点击事件
   * @param event
   */
  private onResultHistoryBtnClick(event: Event) {
    console.log(`onResultHistoryBtnClick--->`);
  }
}
