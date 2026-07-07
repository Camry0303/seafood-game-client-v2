import {
  _decorator,
  Component,
  Event,
  Node,
  tween,
  Tween,
  UITransform,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import DicesGameEvents from "../../../Network/SocketIo/DicesGameEvents";
import { Gateway } from "../../../Types/typing";
import { CLUB_PLAYER_ROLE, GAME_ROOM_STATUS } from "../../../Enums";
import { GlobalData } from "../../../Runtime/GlobalData";
import { SoundsManager } from "../../../Runtime/SoundsManager";
const { ccclass, property, menu } = _decorator;

@ccclass("DicesGameStatusContainer_Component")
@menu("Hidden/DicesGamePlayerSeat_Component")
export class DicesGameStatusContainer_Component extends ComponentController {
  // 房间状态面板节点
  private _roomStatusPanelNode: Node = null;
  // 游戏未开始节点
  private _notStartNode: Node = null;
  // 等待节点
  private _waitingNode: Node = null;
  // 游戏结束节点
  private _gameOverNode: Node = null;

  private _gamingStatusPanelNode: Node = null;
  // 开始下单节点
  private _startOrderNode: Node = null;
  // 开始下单蒙版节点
  private _startOrderMaskNode: Node = null;
  // 停止下单节点
  private _stopOrderNode: Node = null;
  // 停止下单蒙版节点
  private _stopOrderMaskNode: Node = null;

  // 按钮面板节点
  private _buttonPanelNode: Node = null;
  // 设置庄家按钮节点
  private _setDealerBtnNode: Node = null;
  // 开始游戏按钮节点
  private _startGameBtnNode: Node = null;

  // 开始下单缓动
  private _startOrderTween: Tween = null;
  // 停止下单缓动
  private _stopOrderTween: Tween = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取房间状态面板节点
    this._roomStatusPanelNode = this.getNode("RoomStatusPanel");
    // 获取游戏未开始节点
    this._notStartNode = this.getNode("RoomStatusPanel/NotStart");
    // 获取等待节点
    this._waitingNode = this.getNode("RoomStatusPanel/Waiting");
    // 获取游戏结束节点
    this._gameOverNode = this.getNode("RoomStatusPanel/GameOver");

    // 获取游戏状态面板节点
    this._gamingStatusPanelNode = this.getNode("GamingStatusPanel");
    // 获取开始下单节点
    this._startOrderNode = this.getNode("GamingStatusPanel/StartOrder");
    // 获取开始下单蒙版节点
    this._startOrderMaskNode = this.getNode(
      "GamingStatusPanel/StartOrder/Mask",
    );
    // 获取停止下单节点
    this._stopOrderNode = this.getNode("GamingStatusPanel/StopOrder");
    // 获取停止下单蒙版节点
    this._stopOrderMaskNode = this.getNode("GamingStatusPanel/StopOrder/Mask");

    // 获取按钮面板节点
    this._buttonPanelNode = this.getNode("ButtonPanel");
    // 设置指定庄家按钮点击事件
    [this._setDealerBtnNode] = this.setButtonClickEvent(
      "ButtonPanel/SetDealerBtn",
      0,
      "onSetDealerBtnClick",
      this.getClassName(),
    );
    // 设置开始游戏按钮点击事件
    [this._startGameBtnNode] = this.setButtonClickEvent(
      "ButtonPanel/StartGameBtn",
      0,
      "onStartGameBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 指定庄家按钮点击事件
   * @param event
   */
  private onSetDealerBtnClick(event: Event) {
    console.log("onSetDealerBtnClick");
    CommonDailogHandler.showDialogMiniKeyboard(
      "SetDealerToggle",
      6,
      (value: string) => {
        // 指定庄家
        const player_id = parseInt(value, 10);
        DicesGameEvents.setClubGameDealer({ player_id });
      },
    );
  }

  /**
   * 指定开始游戏按钮点击事件
   * @param event
   */
  private onStartGameBtnClick(event: Event) {
    console.log("onStartGameBtnClick");
    DicesGameEvents.startClubGame();
  }

  /**
   * 更新房间状态UI
   * @param data
   */
  public updateRoomStatusUI(
    data: Gateway.Returned.Games.DicesGame.GamingStatusgData,
  ) {
    // 获取当前玩家角色
    const role: CLUB_PLAYER_ROLE =
      GlobalData.Instance.getCurrentClubPlayerInfo()?.role;

    // 判断游戏是否已经开始
    if (data.status === GAME_ROOM_STATUS.WAITING) {
      this._roomStatusPanelNode.active = true;
      this._notStartNode.active = true;
      this._waitingNode.active = false;
      this._gameOverNode.active = false;

      this._gamingStatusPanelNode.active = false;

      this._buttonPanelNode.active =
        role === CLUB_PLAYER_ROLE.ADMIN || role === CLUB_PLAYER_ROLE.SUB_ADMIN;
      this._setDealerBtnNode.active = data.dealer_id ? false : true;
      this._startGameBtnNode.active = data.dealer_id ? true : false;
    } else {
      this._roomStatusPanelNode.active = false;

      this._gamingStatusPanelNode.active = false;
      this._startOrderNode.active = false;
      this._stopOrderNode.active = false;
      this._buttonPanelNode.active = false;
    }
  }

  /**
   * 更新游戏状态UI
   * @param data
   */
  public updateGamingStatusUI(
    data: "PREPARATION" | "START_ORDER" | "STOP_ORDER" | "GAME_OVER",
  ) {
    if (data === "PREPARATION") {
      this._roomStatusPanelNode.active = false;

      this._gamingStatusPanelNode.active = false;
      this._startOrderNode.active = false;
      this._stopOrderNode.active = false;
      this._buttonPanelNode.active = false;
    } else if (data === "START_ORDER") {
      this._gamingStatusPanelNode.active = true;
      this._startOrderNode.active = true;
      this._stopOrderNode.active = false;
      const startOrderWidth =
        this._startOrderNode.getComponent(UITransform).width;

      if (this._startOrderTween) {
        this._startOrderTween.stop();
      } else {
        this._startOrderTween = tween(
          this._startOrderMaskNode.getComponent(UITransform),
        )
          .to(0, {
            width: 0,
          })
          .call(() => {
            // 播放音效
            SoundsManager.Instance.playEffect("start_order");
          })
          .to(0.5, {
            width: startOrderWidth,
          })
          .delay(1)
          .call(() => {
            this._gamingStatusPanelNode.active = false;
          });
      }

      this._startOrderTween.start();
    } else if (data === "STOP_ORDER") {
      this._gamingStatusPanelNode.active = true;
      this._startOrderNode.active = false;
      this._stopOrderNode.active = true;
      if (this._stopOrderTween) {
        this._stopOrderTween.stop();
      } else {
        const stopOrderWidth =
          this._stopOrderNode.getComponent(UITransform).width;

        this._stopOrderTween = tween(
          this._stopOrderMaskNode.getComponent(UITransform),
        )
          .to(0, {
            width: 0,
          })
          .call(() => {
            // 播放音效
            SoundsManager.Instance.playEffect("stop_order");
          })
          .to(0.5, {
            width: stopOrderWidth,
          })
          .delay(2)
          .call(() => {
            this._gamingStatusPanelNode.active = false;
          });
      }

      this._stopOrderTween.start();
    } else if (data === "GAME_OVER") {
      this._roomStatusPanelNode.active = true;
      this._notStartNode.active = false;
      this._waitingNode.active = false;
      this._gameOverNode.active = true;
    }
  }
}
