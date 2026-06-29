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
import { DicesGameStatusContainer_Component } from "./DicesGameStatusContainer_Component";
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

  //#region 游戏状态面板相关属性
  private _gameStatusContainer: Node = null;
  private _gameStatusContainerComponent: DicesGameStatusContainer_Component =
    null;
  //#endregion

  // 历史结果记录
  private _results_history_data: number[][] = [];

  // 玩家下单分组汇总数据 key:seat_code-player_id
  private _players_orders_grouped_data: Record<
    string,
    Gateway.Returned.Games.DicesGame.OrderData[]
  > = {};

  start() {
    //FIXME - // 获取游戏状态
    // DicesGameEvents.getClubGamingStatus();
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

    // 获取游戏状态面板节点
    this._gameStatusContainer = this.getNode("StatusContainer");
    // 添加游戏状态面板组件
    this._gameStatusContainerComponent = this._gameStatusContainer.addComponent(
      DicesGameStatusContainer_Component,
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
   * 获取游戏状态面板组件
   * @returns
   */
  public getGameStatusContainerComponent(): DicesGameStatusContainer_Component {
    return this._gameStatusContainerComponent;
  }

  /**
   * 更新游戏状态
   * @param data
   */
  public updateGameStatus(
    data: Gateway.Returned.Games.DicesGame.GamingStatusgData,
  ) {
    console.log(`updateGameStatus--->`, data);
    // 更新数据
    this._results_history_data = data.results_history;
    this._players_orders_grouped_data = data.players_orders_grouped;

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

    // 更新游戏状态面板UI
    this._gameStatusContainerComponent.updateRoomStatusUI(data);
  }

  /**
   * 设置游戏开始
   * @param remaining_time
   * @param current_round
   */
  public setGameStart(remaining_time: number, current_round: number) {
    // 更新顶部状态栏UI
    this._topStatusBarComponent.updateTopStatusBarUI(current_round);
    // 更新桌面区域UI计时器UI
    this._gameTableComponent.updateTimeCounterUI(
      DICES_GAMING_STATUS.PREPARATION,
      remaining_time,
    );
    // 播放骰盅摇动动画
    this._gameTableComponent.playShakeDiceCupAnimation();
  }

  /**
   * 设置开始下单
   * @param remaining_time
   */
  public setStartOrder(remaining_time: number) {
    // 更新桌面区域UI计时器UI
    this._gameTableComponent.updateTimeCounterUI(
      DICES_GAMING_STATUS.ORDERING,
      remaining_time,
    );
    // 设置游戏状态
    this._gameStatusContainerComponent.updateGamingStatusUI("START_ORDER");
  }

  // 设置停止下单
  public setStopOrder(remaining_time: number) {
    // 设置游戏状态
    this._gameStatusContainerComponent.updateGamingStatusUI("STOP_ORDER");
  }

  /**
   * 设置开骰
   * @param remaining_time
   * @param results
   */
  public setOpenResults(remaining_time: number, results: number[]) {
    // 更新历史结果
    this._results_history_data.push(results);
    // 更新桌面区域UI计时器UI
    this._gameTableComponent.updateTimeCounterUI(
      DICES_GAMING_STATUS.OPEN,
      remaining_time,
    );
    // 播放开骰动画
    this._gameTableComponent.playerOpenDiceCupAnimation(results);
  }
}
