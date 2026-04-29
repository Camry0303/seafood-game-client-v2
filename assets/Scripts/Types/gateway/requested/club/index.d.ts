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
export type RenameClubParams = {
  club_name: string;
};

/**
 * 修改俱乐部公告参数
 */
export type AlterClubAnnounceParams = {
  announcement: string;
};

/**
 * 转让俱乐部参数
 */
export type HandOverClubParams = {
  player_id: number;
};
