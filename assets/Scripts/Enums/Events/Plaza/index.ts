/**
 * Socket大厅事件枚举
 */
export enum PLAZA_EVENT {
  MAIN_CONNECTED_RESULT = "Main.Connected.Result",
  INCOMING_CLUB_HINT_RESULT = "Plaza.IncomingClubHint.Result",
  APPLY_CLUB_JOIN_RESULT = "Plaza.ApplyClubJoin.Result",
  APPLY_CLUB_QUIT_RESULT = "Plaza.ApplyClubQuit.Result",

  GET_CURRENT_PLAYER = "Plaza.GetCurrentPlayer",
  GET_CURRENT_PLAYER_RESULT = "Plaza.GetCurrentPlayer.Result",

  CHANGE_NICKNAME = "Plaza.ChangeNickname",
  CHANGE_NICKNAME_RESULT = "Plaza.ChangeNickname.Result",

  SET_CUSTOM_AVATAR = "Plaza.SetCustomAvatar",
  SET_CUSTOM_AVATAR_RESULT = "Plaza.SetCustomAvatar.Result",

  BIND_AGENT = "Plaza.BindAgent",
  BIND_AGENT_RESULT = "Plaza.BindAgent.Result",

  GET_MARQUEES = "Plaza.GetMarquees",
  GET_MARQUEES_RESULT = "Plaza.GetMarquees.Result",

  GET_CLUB_HAS_HINT = "Plaza.GetClubHasHint",
  GET_CLUB_HAS_HINT_RESULT = "Plaza.GetClubHasHint.Result",

  GAME_RECONNECT = "Plaza.GameReconnect",
  GAME_RECONNECT_RESULT = "Plaza.GameReconnect.Result",
}
