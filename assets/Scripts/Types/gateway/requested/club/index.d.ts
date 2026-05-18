/**
 * 创建俱乐部参数
 */
export type CreateClubParams = {
  club_name: string;
};

/**
 * 通过俱乐部ID加入俱乐部参数
 */
export type JoinClubByIdParams = {
  club_id: number;
};

/**
 * 通过邀请码加入俱乐部参数
 */
export type JoinClubByInviteCodeParams = {
  invite_code: string;
};

/**
 * 进入俱乐部参数
 */
export type EnterClubParams = {
  club_id: number;
};

/**
 * 修改俱乐部名称参数
 */
export type ChangeClubNameParams = {
  club_name: string;
};

/**
 * 修改俱乐部公告参数
 */
export type ChangeClubAnnouncementParams = {
  announcement: string;
};

/**
 * 转让俱乐部参数
 */
export type HandOverClubParams = {
  player_id: number;
};

/**
 * 获取成员管理列表参数
 */
export type GetMemberManagementListParams = {
  current: number;
  pageSize: number;
  nickname_or_id?: string;
};

/**
 * 修改成员分数参数
 */
export type ChangeClubPlayerScoreParams = {
  player_id: number;
  score: number;
};

/**
 * 获取成员列表参数
 */
export type GetMemberListParams = GetMemberManagementListParams;
