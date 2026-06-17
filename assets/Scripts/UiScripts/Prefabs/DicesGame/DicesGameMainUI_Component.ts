import { _decorator, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameTopStatusBar_Component } from "./DicesGameTopStatusBar_Component";
import { DicesGameBottomStatusBar_Component } from "./DicesGameBottomStatusBar_Component";
import { DicesGameGameTable_Component } from "./DicesGameGameTable_Component";
import { DicesGamePlayerSeatsContainer_Component } from "./DicesGamePlayerSeatsContainer_Component";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import DicesGameEvents from "../../../Network/SocketIo/DicesGameEvents";
import { Gateway } from "../../../Types/typing";
import { DICES_GAMING_STATUS, GAME_ROOM_STATUS } from "../../../Enums";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameMainUI_Component")
@menu("Hidden/DicesGameMainUI_Component")
export class DicesGameMainUI_Component extends ComponentController {
  //#region 顶部状态栏属性
  private _topStatusBar: Node = null;
  private _topStatusBarComponent: DicesGameTopStatusBar_Component = null;
  //#endregion

  //#region 底部状态栏属性
  private _bottomStatusBar: Node = null;
  private _bottomStatusBarComponent: DicesGameBottomStatusBar_Component = null;
  //#endregion

  //#region 游戏桌面区域属性
  private _gameTable: Node = null;
  private _gameTableComponent: DicesGameGameTable_Component = null;
  //#endregion

  //#region 玩家座位区域属性
  private _playerSeats: Node = null;
  private _playerSeatsComponents: DicesGamePlayerSeatsContainer_Component =
    null;
  //#endregion

  start() {
    // 获取游戏状态
    DicesGameEvents.getClubGamingStatus();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取顶部状态栏节点
    this._topStatusBar = this.getNode("TopStatusBar");
    // 添加顶部状态栏组件
    this._topStatusBarComponent = this._topStatusBar.addComponent(
      DicesGameTopStatusBar_Component,
    );

    // 获取底部状态栏节点
    this._bottomStatusBar = this.getNode("BottomStatusBar");
    // 添加底部状态栏组件
    this._bottomStatusBarComponent = this._bottomStatusBar.addComponent(
      DicesGameBottomStatusBar_Component,
    );

    // 获取游戏桌面节点
    this._gameTable = this.getNode("GameTable");
    // 添加游戏桌面组件
    this._gameTableComponent = this._gameTable.addComponent(
      DicesGameGameTable_Component,
    );

    // 获取玩家座位节点
    this._playerSeats = this.getNode("PlayerSeatsContainer");
    // 添加玩家座位组件
    this._playerSeatsComponents = this._playerSeats.addComponent(
      DicesGamePlayerSeatsContainer_Component,
    );
  }

  /**
   * 关闭弹窗
   */
  public close() {
    // 销毁节点
    ComponentManager.Instance.destroyNode(this.node);
  }

  /**
   * 获取顶部状态栏组件
   * @returns
   */
  public getTopStatusBarComponent(): DicesGameTopStatusBar_Component {
    return this._topStatusBarComponent;
  }

  /**
   * 获取底部状态栏组件
   * @returns
   */
  public getBottomStatusBarComponent(): DicesGameBottomStatusBar_Component {
    return this._bottomStatusBarComponent;
  }

  /**
   * 获取游戏桌面组件
   * @returns
   */
  public getGameTableComponent(): DicesGameGameTable_Component {
    return this._gameTableComponent;
  }

  /**
   * 获取玩家座位组件
   * @returns
   */
  public getPlayerSeatsComponent(): DicesGamePlayerSeatsContainer_Component {
    return this._playerSeatsComponents;
  }

  /**
   * 更新游戏状态
   * @param data
   */
  public updateGameStatus(
    data: Gateway.Returned.Games.DicesGame.GamingStatusgData,
  ) {
    // 更新顶部状态栏UI
    this._topStatusBarComponent.updateTopStatusBarUI(data.current_round);

    // 更新底部状态栏玩家信息UI
    this._bottomStatusBarComponent.updatePlayerUI(data.dealer_id);

    // 更新桌面区域UI计时器UI
    this._gameTableComponent.updateTimeCounterUI(
      data.status === GAME_ROOM_STATUS.WAITING ||
        data.status === GAME_ROOM_STATUS.DISMISS
        ? DICES_GAMING_STATUS.NONE
        : data.gaming_status,
      data.remaining_time,
    );

    // 更新玩家座位UI
    this._playerSeatsComponents.updatePlayerSeatsUI(data.seats);
  }
}
