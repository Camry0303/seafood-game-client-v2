/**
 * Socket俱乐部骰子游戏事件枚举
 */
export enum CLUB_DICES_GAME_EVENT {
  GET_GAMING_STATUS = "ClubDicesGame.GetGamingStatus",
  GET_GAMING_STATUS_RESULT = "ClubDicesGame.GetGamingStatus.Result",

  CREATE_ROOM = "ClubDicesGame.CreateRoom",
  CREATE_ROOM_RESULT = "ClubDicesGame.CreateRoom.Result",

  ADMIN_DISSOLVE_ROOM = "ClubDicesGame.AdminDissolveRoom",
  ADMIN_DISSOLVE_ROOM_RESULT = "ClubDicesGame.AdminDissolveRoom.Result",

  DISSOLVE_ROOM = "ClubDicesGame.DissolveRoom",
  DISSOLVE_ROOM_RESULT = "ClubDicesGame.DissolveRoom.Result",
  ROOM_DISSOLVED_RESULT = "ClubDicesGame.RoomDissolved.Result",

  JOIN_ROOM = "ClubDicesGame.JoinRoom",
  JOIN_ROOM_RESULT = "ClubDicesGame.JoinRoom.Result",
  PLAYER_JOINED_ROOM_RESULT = "ClubDicesGame.PlayerJoinedRoom.Result",

  SPECTATE_ROOM = "ClubDicesGame.SpectateRoom",
  SPECTATE_ROOM_RESULT = "ClubDicesGame.SpectateRoom.Result",

  LEAVE_ROOM = "ClubDicesGame.LeaveRoom",
  LEAVE_ROOM_RESULT = "ClubDicesGame.LeaveRoom.Result",
  PLAYER_LEFT_ROOM_RESULT = "ClubDicesGame.PlayerLeftRoom.Result",

  PLAYER_SCORE_CHANGED_RESULT = "ClubDicesGame.PlayerScoreChanged.Result",

  SET_DEALER = "ClubDicesGame.SetDealer",
  SET_DEALER_RESULT = "ClubDicesGame.SetDealer.Result",
  DEALER_SETTED_RESULT = "ClubDicesGame.DealerSetted.Result",

  START_GAME = "ClubDicesGame.StartGame",
  START_GAME_RESULT = "ClubDicesGame.StartGame.Result",

  CREATE_ORDER = "ClubDicesGame.CreateOrder",
  CREATE_ORDER_RESULT = "ClubDicesGame.CreateOrder.Result",
  ORDER_CREATED_RESULT = "ClubDicesGame.OrderCreated.Result",

  GAME_STARTED_RESULT = "ClubDicesGame.GameStarted.Result",
  START_ORDER_RESULT = "ClubDicesGame.StartOrder.Result",
  STOP_ORDER_RESULT = "ClubDicesGame.StopOrder.Result",
  OPEN_RESULTS_RESULT = "ClubDicesGame.OpenResults.Result",
  SETTLEMENT_RESULT = "ClubDicesGame.Settlement.Result",
  FINAL_SETTLEMENT_RESULT = "ClubDicesGame.FinalSettlement.Result",

  DEBUG_MODE = "ClubDicesGame.DebugMode",
  DEBUG_MODE_RESULT = "ClubDicesGame.DebugMode.Result",

  SET_DEBUG_RESULT = "ClubDicesGame.SetDebugResult",
  SET_DEBUG_RESULT_RESULT = "ClubDicesGame.SetDebugResult.Result",
}

/**
 * 骰子游戏座位状态
 */
export enum DICES_GAME_SEAT_STATUS {
  /**空闲 */
  EMPTY = "empty",
  /**准备 */
  READY = "ready",
  /**等待 */
  WAITING = "waiting",
  /**游戏中 */
  PLAYING = "playing",
}
