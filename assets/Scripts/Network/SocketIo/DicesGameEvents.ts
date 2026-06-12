import { Socket } from "socket.io-client";
import { CLUB_DICES_GAME_EVENT } from "../../Enums/Events/DicesGame";
import { Gateway } from "../../Types/gateway";
import SocketManager from "./SocketManager";
import { WAITING_TYPE } from "../../UiScripts/Prefabs/Common/CircleLoadingUI_Component";
import CommonDailogHandler from "../../Utils/CommonDailogHandler";
import { RESPONE_RESULT } from "../../Enums";

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
    params: Gateway.Requested.Games.Dices.CreateClubDicesGameRoom,
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
    returnData: Gateway.Returned.Common.Result<any>,
  ) {
    console.log(
      "<DicesGameEvent> onCreateClubDicesGameRoomResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_ROOM);
  }
  //#endregion
}
