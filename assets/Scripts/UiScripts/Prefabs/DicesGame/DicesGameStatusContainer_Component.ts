import { _decorator, Component, Event, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import DicesGameEvents from "../../../Network/SocketIo/DicesGameEvents";
const { ccclass, property, menu } = _decorator;

@ccclass("DicesGameStatusContainer_Component")
@menu("Hidden/DicesGamePlayerSeat_Component")
export class DicesGameStatusContainer_Component extends ComponentController {
  // 状态面板节点
  private _statusPanelNode: Node = null;
  // 状态面板蒙版节点
  private _statusPanelMaskNode = null;
  // 游戏未开始节点
  private _notStartNode: Node = null;
  // 等待节点
  private _waitingNode: Node = null;
  // 开始下单节点
  private _startOrderNode: Node = null;
  // 开始下单蒙版节点
  private _startOrderMaskNode: Node = null;
  // 停止下单节点
  private _stopOrderNode: Node = null;
  // 停止下单蒙版节点
  private _stopOrderMaskNode: Node = null;
  // 游戏结束节点
  private _gameOverNode: Node = null;

  // 按钮面板节点
  private _buttonPanelNode: Node = null;
  // 设置庄家按钮节点
  private _setDealerBtnNode: Node = null;
  // 开始游戏按钮节点
  private _startGameBtnNode: Node = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取状态面板节点
    this._statusPanelNode = this.getNode("StatusPanel");
    // 获取状态面板蒙版节点
    this._statusPanelMaskNode = this.getNode("StatusPanel/MaskNode");
    // 获取游戏未开始节点
    this._notStartNode = this.getNode("StatusPanel/NotStart");
    // 获取等待节点
    this._waitingNode = this.getNode("StatusPanel/Waiting");
    // 获取开始下单节点
    this._startOrderNode = this.getNode("StatusPanel/StartOrder");
    // 获取开始下单蒙版节点
    this._startOrderMaskNode = this.getNode("StatusPanel/StartOrder/Mask");
    // 获取停止下单节点
    this._stopOrderNode = this.getNode("StatusPanel/StopOrder");
    // 获取停止下单蒙版节点
    this._stopOrderMaskNode = this.getNode("StatusPanel/StopOrder/Mask");
    // 获取游戏结束节点
    this._gameOverNode = this.getNode("StatusPanel/GameOver");

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
  }

  public updateStatusPanel() {}
}
