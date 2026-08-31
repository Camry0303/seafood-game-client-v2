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
import { GlobalData } from "../../../Runtime/GlobalData";
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

  // 是否可以下单
  private _can_order: boolean = false;

  // 当前局数（缓存最近一次游戏状态/开始游戏推送的 current_round）
  private _currentRound: number = 0;

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
   * 获取当前局数
   * @returns
   */
  public getCurrentRound(): number {
    return this._currentRound;
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
    // 缓存当前局数
    this._currentRound = data.current_round;

    // 更新顶部状态栏UI
    this._topStatusBarComponent.updateTopStatusBarUI(
      data.current_round,
      data.has_robots,
    );

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

    // 处理游戏订单，更新分数板统计数据
    const my_single_order_score_stats = [0, 0, 0, 0, 0, 0];
    const current_single_order_stats = data.current_single_order_stats;
    const current_combo_order_stats = data.current_combo_order_stats;
    const current_leopard_order_stats = data.current_leopard_order_stats;
    const current_move_order_stats = data.current_move_order_stats;
    const clubPlayer = GlobalData.Instance.getCurrentClubPlayerInfo();

    // 清除筹码
    this._gameTableComponent.clearChips();
    // 处理游戏订单
    data.current_orders.forEach((order) => {
      // 处理本家订单
      if (order.player_id === clubPlayer?.player_id && order.order_type === 1) {
        my_single_order_score_stats[Number(order.order_results) - 1] +=
          order.order_score;
      }

      if (order.order_type === 1) {
        // 放置订单筹码
        this._gameTableComponent.placeChip(
          Number(order.order_results),
          order.order_score,
          order.player_id,
        );
      }
    });

    // 设置分数板统计数据
    this._gameTableComponent.setScoreBoardStatsData({
      my_single_order_score_stats,
      current_single_order_stats,
      current_combo_order_stats,
      current_leopard_order_stats,
      current_move_order_stats,
    });

    // 能否下单
    const can_order =
      data.gaming_status === DICES_GAMING_STATUS.ORDERING &&
      data.remaining_time > 2;
    const orderType = this._bottomStatusBarComponent.getOrderType();
    // 下单按钮是否可用
    this._gameTableComponent.setOrderButtonInteractable(
      can_order && (orderType === "Normal" || orderType === "Debug"),
    );
  }

  /**
   * 下单成功处理
   * @param data
   */
  public onOrderCreated(
    data: Gateway.Returned.Games.DicesGame.CreatedOrderResultData,
  ) {
    // 更新对应座位分数（全局广播的下单结果，按 seat_code 匹配前端已渲染座位）
    this._playerSeatsComponents.updatePlayerSeatScore(
      data.seat_code,
      data.current_available_score,
    );

    // 判断是否本玩家订单
    const isMyOrder =
      data.player_id ===
      GlobalData.Instance.getCurrentClubPlayerInfo().player_id;

    // 更新本家的分数
    if (isMyOrder) {
      const clubPlayer = GlobalData.Instance.getCurrentClubPlayerInfo();
      clubPlayer.club_score = data.current_available_score;
    }

    // 更新分数板统计数据
    this._gameTableComponent.updateScoreBoardStats(data, isMyOrder);

    if (data.order_type === 1) {
      // 放置订单筹码动画
      this._gameTableComponent.placeChipAnimation(
        Number(data.order_results),
        data.order_score,
        data.seat_code,
        data.player_id,
      );
    }

    // 处理玩家下单分组汇总数据
    this._players_orders_grouped_data;
    // 汇总数据玩家Key
    const playerKey = `${data.seat_code}-${data.player_id}`;
    // 汇总数据记录
    const groupedOrderDataList = this._players_orders_grouped_data[playerKey];
    // 判断玩家是否有汇总订单数据
    if (!groupedOrderDataList) {
      this._players_orders_grouped_data[playerKey] = [data];
    } else {
      // some 方法会在回调返回 true 时终止遍历
      const isMatched = groupedOrderDataList.some((groupedORderData) => {
        const orderDataKey = `${data.seat_code}-${data.player_id}-${data.order_type}-${data.order_results}`;
        const groupedKey = `${groupedORderData.seat_code}-${groupedORderData.player_id}-${groupedORderData.order_type}-${groupedORderData.order_results}`;

        if (orderDataKey === groupedKey) {
          groupedORderData.order_score += data.order_score;
          return true; // 找到匹配，返回 true 终止 some 循环
        }
        return false;
      });

      if (!isMatched) {
        this._players_orders_grouped_data[playerKey].push(data);
      }
    }
  }

  /**
   * 设置游戏开始
   * @param remaining_time
   * @param current_round
   */
  public setGameStart(data: Gateway.Returned.Games.DicesGame.GameStartedData) {
    // 缓存当前局数
    this._currentRound = data.current_round;
    // 更新顶部状态栏UI
    this._topStatusBarComponent.updateTopStatusBarUI(data.current_round);
    // 更新桌面区域UI计时器UI
    this._gameTableComponent.updateTimeCounterUI(
      DICES_GAMING_STATUS.PREPARATION,
      data.remaining_time,
    );
    // 播放骰盅摇动动画
    this._gameTableComponent.playShakeDiceCupAnimation();
    // 设置游戏状态
    this._gameStatusContainerComponent.updateGamingStatusUI("PREPARATION");

    // 更新分数板统计数据
    const my_single_order_score_stats = [0, 0, 0, 0, 0, 0];
    const current_single_order_stats = data.current_single_order_stats;
    const current_combo_order_stats = data.current_combo_order_stats;
    const current_leopard_order_stats = data.current_leopard_order_stats;
    const current_move_order_stats = data.current_move_order_stats;
    this._gameTableComponent.setScoreBoardStatsData({
      my_single_order_score_stats,
      current_single_order_stats,
      current_combo_order_stats,
      current_leopard_order_stats,
      current_move_order_stats,
    });

    // 玩家下单分组汇总数据
    this._players_orders_grouped_data = {};
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
    // 下单按钮启用
    this._gameTableComponent.setOrderButtonInteractable(true);
    // 切换普通下单模式
    this._bottomStatusBarComponent.showChipsOrderPanel();
    // 设置可以下单
    this._can_order = true;
  }

  /**
   * 设置停止下单
   * @param remaining_time
   */
  public setStopOrder(remaining_time: number) {
    // 设置游戏状态
    this._gameStatusContainerComponent.updateGamingStatusUI("STOP_ORDER");
    // 更新桌面区域UI计时器UI
    this._gameTableComponent.updateTimeCounterUI(
      DICES_GAMING_STATUS.ORDERING,
      remaining_time,
    );
    // 下单按钮禁用
    this._gameTableComponent.setOrderButtonInteractable(false);

    // 切换普通下单模式
    this._bottomStatusBarComponent.showChipsOrderPanel();

    // 设置不可以下单
    this._can_order = false;
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
    // 重置分数板统计数据
    this._gameTableComponent.resetScoreBoardStats();
    // 清除筹码
    this._gameTableComponent.clearChips();
  }

  /**
   * 获取是否可以下单
   * @returns
   */
  public getCanOrder() {
    return this._can_order;
  }

  /**
   * 获取历史结果记录
   * @returns
   */
  public getResultsHistoryData() {
    return this._results_history_data;
  }

  /**
   * 获取玩家下单分组汇总数据
   * @returns
   */
  public getPlayersOrdersGroupedData() {
    return this._players_orders_grouped_data;
  }

  /**
   * 游戏结算
   * @param data
   */
  public onGameSettled(
    data: Gateway.Returned.Games.DicesGame.PlayerSettlementData[],
  ) {
    this._playerSeatsComponents.settlePlayerSeatScore(data);
  }

  /**
   * 进入调试模式
   */
  public intoDebugMode() {
    this._bottomStatusBarComponent.showDebugResultPanel();
  }
}
