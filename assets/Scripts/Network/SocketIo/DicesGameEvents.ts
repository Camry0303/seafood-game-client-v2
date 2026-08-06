import { Socket } from "socket.io-client";
import { CLUB_DICES_GAME_EVENT } from "../../Enums/Events/DicesGame";
import { Gateway } from "../../Types/gateway";
import SocketManager from "./SocketManager";
import { WAITING_TYPE } from "../../UiScripts/Prefabs/Common/CircleLoadingUI_Component";
import CommonDailogHandler from "../../Utils/CommonDailogHandler";
import { GAME_ROOM_STATUS, IN_GAME_TYPE, RESPONE_RESULT } from "../../Enums";
import { ComponentManager } from "../../Runtime/ComponentManager";
import { GameSettingUI_Component } from "../../UiScripts/Prefabs/GameSetting/GameSettingUI_Component";
import { GlobalData } from "../../Runtime/GlobalData";
import { DicesGameMainUI_Component } from "../../UiScripts/Prefabs/DicesGame/DicesGameMainUI_Component";
import { DicesGameOrderDetailsUI_Component } from "../../UiScripts/Prefabs/DicesGame/DicesGameOrderDetailsUI_Component";
import { DicesGameSettlementUI_Component } from "../../UiScripts/Prefabs/DicesGame/DicesGameSettlementUI_Component";
import { DicesGameFinalSettlementUI_Component } from "../../UiScripts/Prefabs/DicesGame/DicesGameFinalSettlementUI_Component";
import sleep from "../../Utils/Sleep";

/**
 * 骰子游戏事件
 */
export default class DicesGameEvents {
  // 事件映射表
  private static _eventsMap: Map<
    CLUB_DICES_GAME_EVENT,
    (data: Gateway.Returned.Common.Result<any>) => void
  > = new Map<
    CLUB_DICES_GAME_EVENT,
    (data: Gateway.Returned.Common.Result<any>) => void
  >([
    [
      CLUB_DICES_GAME_EVENT.CREATE_ROOM_RESULT,
      this.onCreateClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.JOIN_ROOM_RESULT,
      this.onJoinClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.PLAYER_JOINED_ROOM_RESULT,
      this.onPlayerJoinedClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.SPECTATE_ROOM_RESULT,
      this.onSpectateClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.LEAVE_ROOM_RESULT,
      this.onLeaveClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.PLAYER_LEFT_ROOM_RESULT,
      this.onPlayerLeftClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.PLAYER_SCORE_CHANGED_RESULT,
      this.onPlayerScoreChangedClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.ADMIN_DISSOLVE_ROOM_RESULT,
      this.onAdminDissolveClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.ROOM_DISSOLVED_RESULT,
      this.onClubDicesGameRoomDissolvedResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.GET_GAMING_STATUS_RESULT,
      this.onGetClubGamingStatusResult,
    ],
    [CLUB_DICES_GAME_EVENT.SET_DEALER_RESULT, this.onSetDealerResult],
    [CLUB_DICES_GAME_EVENT.DEALER_SETTED_RESULT, this.onDealerSettedResult],
    [CLUB_DICES_GAME_EVENT.START_GAME_RESULT, this.onStartGameResult],

    [CLUB_DICES_GAME_EVENT.CREATE_ORDER_RESULT, this.onCreateOrderResult],
    [CLUB_DICES_GAME_EVENT.ORDER_CREATED_RESULT, this.onOrderCreatedResult],

    [CLUB_DICES_GAME_EVENT.GAME_STARTED_RESULT, this.onGameStartedResult],
    [CLUB_DICES_GAME_EVENT.START_ORDER_RESULT, this.onStartOrderResult],
    [CLUB_DICES_GAME_EVENT.STOP_ORDER_RESULT, this.onStopOrderResult],
    [CLUB_DICES_GAME_EVENT.OPEN_RESULTS_RESULT, this.onOpenResultsResult],
    [CLUB_DICES_GAME_EVENT.SETTLEMENT_RESULT, this.onSettlementResult],
    [
      CLUB_DICES_GAME_EVENT.FINAL_SETTLEMENT_RESULT,
      this.onFinalSettlementResult,
    ],
    [CLUB_DICES_GAME_EVENT.DEBUG_MODE_RESULT, this.onDebugModeResult],
    [
      CLUB_DICES_GAME_EVENT.SET_DEBUG_RESULT_RESULT,
      this.onSetDebugResultResult,
    ],
  ]);

  /**
   * 监听所有骰子游戏事件
   * @param SocketInstance
   */
  public static setDicesGameEventsOn(SocketInstance: Socket) {
    // 批量绑定事件监听器
    for (const [eventName, listener] of this._eventsMap) {
      SocketInstance.on(eventName, listener);
    }
  }

  /**
   * 取消监听所有骰子游戏事件
   * @param SocketInstance
   */
  public static setDicesGameEventsOff(SocketInstance: Socket) {
    // 批量解绑事件监听器
    for (const eventName in this._eventsMap) {
      const listener = this._eventsMap[eventName];
      SocketInstance.off(eventName, listener);
    }
  }

  //#region 创建俱乐部骰子游戏房间
  /**
   * 创建俱乐部骰子游戏房间
   * @param params
   */
  public static createClubDicesGameRoom(
    params: Gateway.Requested.Games.DicesGame.CreateClubDicesGameRoomParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.CREATE_ROOM);
      socket.emit(CLUB_DICES_GAME_EVENT.CREATE_ROOM, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ROOM);
    }
  }

  /**
   *  处理创建俱乐部骰子游戏房间结果
   * @param returnData
   */
  private static onCreateClubDicesGameRoomResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>,
  ) {
    console.log(
      "<DicesGameEvent> onCreateClubDicesGameRoomResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 关闭游戏配置界面
      const [, settingComponent] = ComponentManager.Instance.getNodeComponent(
        "GameSettnigUI",
        GameSettingUI_Component,
      );
      settingComponent && settingComponent.close();

      // 保存游戏信息
      GlobalData.Instance.setCurrentGameInfo<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>(
        {
          in_game_type: IN_GAME_TYPE.CLUB_DICES_GAME,
          game_room_data: data,
        },
      );

      // 挂载游戏界面
      const [, dicesGameMainUIComponent] =
        ComponentManager.Instance.renderUiNode<DicesGameMainUI_Component>(
          "DicesGameMainUI",
          "Prefabs",
          "DicesGame/DicesGameMainUI",
          DicesGameMainUI_Component,
        );
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ROOM);
  }
  //#endregion

  //#region 加入俱乐部骰子游戏房间
  /**
   * 加入俱乐部骰子游戏房间
   * @param params
   */
  public static joinClubDicesGameRoom(
    params: Gateway.Requested.Games.DicesGame.JoinClubDicesGameRoomParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.JOIN_ROOM);
      socket.emit(CLUB_DICES_GAME_EVENT.JOIN_ROOM, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.JOIN_ROOM);
    }
  }

  /**
   * 处理加入俱乐部骰子游戏房间结果
   * @param returnData
   */
  private static onJoinClubDicesGameRoomResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>,
  ) {
    console.log(
      "<DicesGameEvent> onJoinClubDicesGameRoomResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 保存游戏信息
      GlobalData.Instance.setCurrentGameInfo<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>(
        {
          in_game_type: IN_GAME_TYPE.CLUB_DICES_GAME,
          game_room_data: data,
        },
      );

      // 挂载游戏界面
      const [, dicesGameMainUIComponent] =
        ComponentManager.Instance.renderUiNode<DicesGameMainUI_Component>(
          "DicesGameMainUI",
          "Prefabs",
          "DicesGame/DicesGameMainUI",
          DicesGameMainUI_Component,
        );
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.JOIN_ROOM);
  }

  /**
   * 处理玩家加入俱乐部骰子游戏房间结果
   * @param returnData
   */
  private static onPlayerJoinedClubDicesGameRoomResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Games.DicesGame.GameSeatData>,
  ) {
    console.log(
      "<DicesGameEvent> onPlayerJoinedClubDicesGameRoomResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component && component.getPlayerSeatsComponent()?.updatePlayerSeat(data);
    }
  }
  //#endregion

  //#region 观战俱乐部骰子游戏房间
  /**
   * 观战俱乐部骰子游戏房间
   * @param params
   */
  public static spectateClubDicesGameRoom(
    params: Gateway.Requested.Games.DicesGame.SpectateClubDicesGameRoomParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.SPECTATE_ROOM);
      socket.emit(CLUB_DICES_GAME_EVENT.SPECTATE_ROOM, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SPECTATE_ROOM);
    }
  }

  /**
   * 处理观战俱乐部骰子游戏房间结果
   * @param returnData
   */
  private static onSpectateClubDicesGameRoomResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>,
  ) {
    console.log(
      "<DicesGameEvent> onSpectateClubDicesGameRoomResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 保存游戏信息
      GlobalData.Instance.setCurrentGameInfo<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>(
        {
          in_game_type: IN_GAME_TYPE.CLUB_DICES_GAME,
          game_room_data: data,
        },
      );

      // 挂载游戏界面
      const [, dicesGameMainUIComponent] =
        ComponentManager.Instance.renderUiNode<DicesGameMainUI_Component>(
          "DicesGameMainUI",
          "Prefabs",
          "DicesGame/DicesGameMainUI",
          DicesGameMainUI_Component,
        );
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SPECTATE_ROOM);
  }
  //#endregion

  //#region 离开俱乐部骰子游戏房间
  /**
   * 离开俱乐部骰子游戏房间
   */
  public static leaveClubDicesGameRoom() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.LEAVE_ROOM);
      socket.emit(CLUB_DICES_GAME_EVENT.LEAVE_ROOM);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LEAVE_ROOM);
    }
  }

  /**
   * 处理离开俱乐部骰子游戏房间结果
   * @param returnData
   */
  private static onLeaveClubDicesGameRoomResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log(
      "<DicesGameEvent> onLeaveClubDicesGameRoomResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 关闭游戏界面
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component && component.close();
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LEAVE_ROOM);
  }

  /**
   * 处理玩家离开俱乐部骰子游戏房间结果
   * @param returnData
   */
  private static onPlayerLeftClubDicesGameRoomResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Games.DicesGame.GameSeatData>,
  ) {
    console.log(
      "<DicesGameEvent> onPlayerLeftClubDicesGameRoomResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component && component.getPlayerSeatsComponent()?.updatePlayerSeat(data);
    }
  }
  //#endregion

  //#region 处理玩家分数变更结果
  /**
   * 处理玩家分数变更结果
   * @param returnData
   */
  private static onPlayerScoreChangedClubDicesGameRoomResult(
    returnData: Gateway.Returned.Common.Result<{
      seat_code: string;
      player_id: number;
      score: number;
    }>,
  ) {
    console.log(
      "<DicesGameEvent> onPlayerScoreChangedClubDicesGameRoomResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component &&
        component
          .getPlayerSeatsComponent()
          ?.updatePlayerSeatScore(data.seat_code, data.score);
      const clubPlayer = GlobalData.Instance.getCurrentClubPlayerInfo();
      // 更新玩家分数
      if (clubPlayer?.player_id === data.player_id) {
        clubPlayer.club_score = data.score;
      }
    }
  }
  //#endregion

  //#region 管理员解散俱乐部骰子游戏房间
  /**
   * 管理员解散俱乐部骰子游戏房间
   */
  public static adminDissolveClubDicesGameRoom() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.DISSOLVE_ROOM);
      socket.emit(CLUB_DICES_GAME_EVENT.ADMIN_DISSOLVE_ROOM);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.DISSOLVE_ROOM);
    }
  }

  /**
   * 处理管理员解散俱乐部骰子游戏房间结果
   * @param returnData
   */
  private static onAdminDissolveClubDicesGameRoomResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log(
      "<DicesGameEvent> onAdminDissolveClubDicesGameRoomResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 提示解散成功，关闭游戏界面在游戏总结算界面关闭按钮中
      CommonDailogHandler.showBubbleMessage(`解散成功！`);
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.DISSOLVE_ROOM);
  }
  //#endregion

  //#region 俱乐部骰子游戏房间解散通知
  /**
   * 俱乐部骰子游戏房间解散通知
   * @param returnData
   */
  private static onClubDicesGameRoomDissolvedResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log(
      "<DicesGameEvent> onClubDicesGameRoomDissolvedResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const room = GlobalData.Instance.getCurrentGameInfo();
      if (room) {
        room.game_room_data.status = GAME_ROOM_STATUS.DISMISS;
      }
    }
  }
  //#endregion

  //#region 俱乐部游戏房间状态
  /**
   * 获取俱乐部游戏房间状态
   */
  public static getClubGamingStatus() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.GET_GAME_STATUS);
      socket.emit(CLUB_DICES_GAME_EVENT.GET_GAMING_STATUS);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_GAME_STATUS);
    }
  }

  /**
   * 处理获取俱乐部游戏房间状态结果
   * @param returnData
   */
  private static onGetClubGamingStatusResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Games.DicesGame.GamingStatusgData>,
  ) {
    console.log(
      "<DicesGameEvent> onGetClubGamingStatusResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const room = GlobalData.Instance.getCurrentGameInfo();
      if (room) {
        room.game_room_data.status = data.status;
      }

      // 更新游戏状态
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );

      component && component.updateGameStatus(data);
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
      // 关闭最终结算界面
      const [fsnode, fscomponent] = ComponentManager.Instance.getNodeComponent(
        "DicesGameFinalSettlementUI",
        DicesGameFinalSettlementUI_Component,
      );
      fscomponent && fscomponent.close();
      // 关闭结算界面
      const [snode, scomponent] = ComponentManager.Instance.getNodeComponent(
        "DicesGameSettlementUI",
        DicesGameSettlementUI_Component,
      );
      scomponent && scomponent.close();
      // 关闭下单详情界面
      const [dnode, dcomponent] = ComponentManager.Instance.getNodeComponent(
        "DicesGameOrderDetailsUI",
        DicesGameOrderDetailsUI_Component,
      );
      dcomponent && dcomponent.close();
      // 关闭主界面
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component && component.close();
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_GAME_STATUS);
  }
  //#endregion

  //#region 俱乐部上庄相关
  /**
   * 设置俱乐部上庄
   * @param params
   */
  public static setClubGameDealer(
    params: Gateway.Requested.Games.DicesGame.SetDealerParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.SET_DEALER);
      socket.emit(CLUB_DICES_GAME_EVENT.SET_DEALER, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SET_DEALER);
    }
  }

  /**
   * 处理设置俱乐部上庄结果
   * @param returnData
   */
  private static onSetDealerResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<DicesGameEvent> onSetDealerResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SET_DEALER);
  }

  /**
   * 俱乐部上庄完成通知结果
   * @param returnData
   */
  private static onDealerSettedResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Games.DicesGame.GameSeatData>,
  ) {
    console.log(
      "<DicesGameEvent> onDealerSettedResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
    }
  }
  //#endregion

  //#region 开始俱乐部游戏
  /**
   * 开始俱乐部游戏
   */
  public static startClubGame() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.START_GAME);
      socket.emit(CLUB_DICES_GAME_EVENT.START_GAME);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.START_GAME);
    }
  }

  /**
   * 处理开始俱乐部游戏结果
   * @param returnData
   */
  private static onStartGameResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<DicesGameEvent> onStartGameResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.START_GAME);
  }
  //#endregion

  //#region 订单创建
  /**
   * 创建订单
   * @param params
   */
  public static createOrder(
    params: Gateway.Requested.Games.DicesGame.CreateOrderParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.CREATE_ORDER, undefined, {
        silent: true,
      });
      socket.emit(CLUB_DICES_GAME_EVENT.CREATE_ORDER, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ORDER);
    }
  }

  /**
   * 处理创建订单结果
   * @param returnData
   */
  private static onCreateOrderResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<DicesGameEvent> onCreateOrderResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ORDER);
  }

  /**
   * 处理订单被创建结果
   * @param returnData
   */
  private static onOrderCreatedResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Games.DicesGame.CreatedOrderResultData>,
  ) {
    console.log(
      "<DicesGameEvent> onOrderCreatedResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component && component.onOrderCreated(data);

      const [dNode, dComponent] = ComponentManager.Instance.getNodeComponent(
        "DicesGameOrderDetailsUI_Component",
        DicesGameOrderDetailsUI_Component,
      );
      dComponent && dComponent.onOrderCreated(data);
    }
  }
  //#endregion

  //#region 调试模式
  /**
   * 进入调试模式
   */
  public static debugMode() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.DEBUG_MODE);
      socket.emit(CLUB_DICES_GAME_EVENT.DEBUG_MODE);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.DEBUG_MODE);
    }
  }

  /**
   * 处理进入调试模式结果
   * @param returnData
   */
  private static onDebugModeResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<DicesGameEvent> onDebugModeResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 进入调试模式
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      if (data) {
        component && component.intoDebugMode();
      }
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.DEBUG_MODE);
  }
  //#endregion

  //#region 设置调试结果
  /**
   * 设置调试结果
   * @param params
   */
  public static setDebugResult(params: { results: string }) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.SET_DEBUG_RESULT);
      socket.emit(CLUB_DICES_GAME_EVENT.SET_DEBUG_RESULT, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SET_DEBUG_RESULT);
    }
  }

  /**
   * 处理设置调试结果结果
   * @param returnData
   */
  private static onSetDebugResultResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log(
      "<DicesGameEvent> onSetDebugResultResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      CommonDailogHandler.showBubbleMessage(`操作成功!`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SET_DEBUG_RESULT);
  }
  //#endregion

  //#region 俱乐部游戏房间游戏过程通知
  /**
   * 处理游戏开始通知结果
   * @param returnData
   */
  private static onGameStartedResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Games.DicesGame.GameStartedData>,
  ) {
    console.log("<DicesGameEvent> onGameStartedResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component && component.setGameStart(data);

      // 关闭结算界面
      const [snode, scomponent] = ComponentManager.Instance.getNodeComponent(
        "DicesGameSettlementUI",
        DicesGameSettlementUI_Component,
      );
      scomponent && scomponent.close();
    }
  }

  /**
   * 处理开始下单通知结果
   * @param returnData
   */
  private static onStartOrderResult(
    returnData: Gateway.Returned.Common.Result<{ remaining_time: number }>,
  ) {
    console.log("<DicesGameEvent> onStartOrderResult called --->", returnData);

    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );

      component && component.setStartOrder(data.remaining_time);
    }
  }

  /**
   * 处理结束下单通知结果
   * @param returnData
   */
  private static onStopOrderResult(
    returnData: Gateway.Returned.Common.Result<{
      remaining_time: number;
    }>,
  ) {
    console.log("<DicesGameEvent> onStopOrderResult called --->", returnData);

    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component && component.setStopOrder(data.remaining_time);
    }
  }

  /**
   * 处理开骰通知结果
   * @param returnData
   */
  private static onOpenResultsResult(
    returnData: Gateway.Returned.Common.Result<{
      remaining_time: number;
      results: number[];
    }>,
  ) {
    console.log("<DicesGameEvent> onOpenResultsResult called --->", returnData);

    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component && component.setOpenResults(data.remaining_time, data.results);
    }
  }

  /**
   * 处理结算结果
   * @param returnData
   */
  private static async onSettlementResult(
    returnData: Gateway.Returned.Common.Result<{
      results: number[];
      settlements: Gateway.Returned.Games.DicesGame.PlayerSettlementData[];
    }>,
  ) {
    console.log("<DicesGameEvent> onSettlementResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 先做飘分动画
      const { code, data, msg } = returnData;
      if (code === RESPONE_RESULT.SUCCESS) {
        const [node, component] = ComponentManager.Instance.getNodeComponent(
          "DicesGameMainUI",
          DicesGameMainUI_Component,
        );
        component && component.onGameSettled(data.settlements);

        // 等待一秒后，弹出结算界面
        await sleep(1000);
        const [snode, scomponent] =
          ComponentManager.Instance.renderUiNode<DicesGameSettlementUI_Component>(
            "DicesGameSettlementUI",
            "Prefabs",
            "DicesGame/DicesGameSettlementUI",
            DicesGameSettlementUI_Component,
          );
        scomponent && scomponent.setData(data);
      }
    }
  }

  /**
   * 处理最终结算结果
   * @param returnData
   */
  private static onFinalSettlementResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Games.DicesGame.PlayerFinalSettlementData[]
    >,
  ) {
    console.log(
      "<DicesGameEvent> onFinalSettlementResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 挂载总结算界面
      const [node, component] =
        ComponentManager.Instance.renderUiNode<DicesGameFinalSettlementUI_Component>(
          "DicesGameFinalSettlementUI",
          "Prefabs",
          "DicesGame/DicesGameFinalSettlementUI",
          DicesGameFinalSettlementUI_Component,
        );
      component && component.setData(data);

      // 关闭结算界面
      const [snode, scomponent] = ComponentManager.Instance.getNodeComponent(
        "DicesGameSettlementUI",
        DicesGameSettlementUI_Component,
      );
      scomponent && scomponent.close();
    }
  }
  //#endregion
}
