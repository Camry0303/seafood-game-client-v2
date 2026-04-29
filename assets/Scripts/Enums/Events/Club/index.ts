/**
 * Socket俱乐部事件枚举
 */
export enum CLUB_EVENT {
  GET_PLAYER_CLUB_LIST = "Club.GetPlayerClubList",
  GET_PLAYER_CLUB_LIST_RESULT = "Club.GetPlayerClubList.Result",

  CREATE_CLUB = "Club.CreateClub",
  CREATE_CLUB_RESULT = "Club.CreateClub.Result",

  JOIN_CLUB_BY_ID = "Club.JoinClubByClubId",
  JOIN_CLUB_BY_ID_RESULT = "Club.JoinClubByClubId.Result",

  QUIT_CLUB = "Club.QuitClub",
  QUIT_CLUB_RESULT = "Club.QuitClub.Result",

  ENTER_CLUB = "Club.EnterClub",
  ENTER_CLUB_RESULT = "Club.EnterClub.Result",

  LEAVE_CLUB = "Club.LeaveClub",
  LEAVE_CLUB_RESULT = "Club.LeaveClub.Result",
}
