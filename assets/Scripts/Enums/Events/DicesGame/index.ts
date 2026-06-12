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

  JOIN_ROOM = "ClubDicesGame.JoinRoom",
  JOIN_ROOM_RESULT = "ClubDicesGame.JoinRoom.Result",

  LEAVE_ROOM = "ClubDicesGame.LeaveRoom",
  LEAVE_ROOM_RESULT = "ClubDicesGame.LeaveRoom.Result",
}
