import { Socket } from "socket.io-client";
import { CLUB_DICES_GAME_EVENT } from "../../Enums/Events/DicesGame";
import { Gateway } from "../../Types/gateway";
import SocketManager from "./SocketManager";
import { WAITING_TYPE } from "../../UiScripts/Prefabs/Common/CircleLoadingUI_Component";
import CommonDailogHandler from "../../Utils/CommonDailogHandler";
import { IN_GAME_TYPE, RESPONE_RESULT } from "../../Enums";
import { ComponentManager } from "../../Runtime/ComponentManager";
import { GameSettingUI_Component } from "../../UiScripts/Prefabs/GameSetting/GameSettingUI_Component";
import { GlobalData } from "../../Runtime/GlobalData";
import { DicesGameMainUI_Component } from "../../UiScripts/Prefabs/DicesGame/DicesGameMainUI_Component";

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
      CLUB_DICES_GAME_EVENT.SPECTATE_ROOM_RESULT,
      this.onSpectateClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.LEAVE_ROOM_RESULT,
      this.onLeaveClubDicesGameRoomResult,
    ],
    [
      CLUB_DICES_GAME_EVENT.ADMIN_DISSOLVE_ROOM_RESULT,
      this.onAdminDissolveClubDicesGameRoomResult,
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
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.CREATE_ROOM);
      socket.emit(CLUB_DICES_GAME_EVENT.JOIN_ROOM, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ROOM);
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
    console.log("<DicesGameEvent> onLeaveClubDicesGameRoomResult called --->");
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 关闭游戏界面
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );
      component.close();
    } else {
      // 弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LEAVE_ROOM);
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
}
