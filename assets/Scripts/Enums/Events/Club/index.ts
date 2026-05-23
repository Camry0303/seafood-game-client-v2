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

  CHANGE_NAME = "Club.ChangeName",
  CHANGE_NAME_RESULT = "Club.ChangeName.Result",

  CHANGE_ANNOUNCEMENT = "Club.ChangeAnnouncement",
  CHANGE_ANNOUNCEMENT_RESULT = "Club.ChangeAnnouncement.Result",

  SET_SUB_ADMIN = "Club.SetSubAdmin",
  SET_SUB_ADMIN_RESULT = "Club.SetSubAdmin.Result",

  QUERY_CLUB_PLAYER_UNREVIEWED_APPLICATION_LIST = "Club.QueryClubPlayerUnreviewedApplicationList",
  QUERY_CLUB_PLAYER_UNREVIEWED_APPLICATION_LIST_RESULT = "Club.QueryClubPlayerUnreviewedApplicationList.Result",

  REVIEW_CLUB_PLAYER_APPLICATION = "Club.ReviewClubPlayerApplication",
  REVIEW_CLUB_PLAYER_APPLICATION_RESULT = "Club.ReviewClubPlayerApplication.Result",

  GET_MEMBER_MANAGEMENT_LIST = "Club.GetMemberManagementList",
  GET_MEMBER_MANAGEMENT_LIST_RESULT = "Club.GetMemberManagementList.Result",

  CHANGE_CLUB_PLAYER_SCORE = "Club.ChangeClubPlayerScore",
  CHANGE_CLUB_PLAYER_SCORE_RESULT = "Club.ChangeClubPlayerScore.Result",

  GET_MEMBER_LIST = "Club.GetMemberList",
  GET_MEMBER_LIST_RESULT = "Club.GetMemberList.Result",

  DEMOTE_OR_DELETE_MEMBER = "Club.DemoteOrDeleteMember",
  DEMOTE_OR_DELETE_MEMBER_RESULT = "Club.DemoteOrDeleteMember.Result",

  GET_PARTNER_LIST = "Club.GetPartnerList",
  GET_PARTNER_LIST_RESULT = "Club.GetPartnerList.Result",

  ADD_PARTNER = "Club.AddPartner",
  ADD_PARTNER_RESULT = "Club.AddPartner.Result",

  DELETE_PARTNER = "Club.DeletePartner",
  DELETE_PARTNER_RESULT = "Club.DeletePartner.Result",
}
