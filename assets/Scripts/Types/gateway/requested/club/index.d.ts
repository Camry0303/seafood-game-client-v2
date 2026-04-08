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
 * 设置俱乐部基础配置参数
 */
export type SetClubBaseConfigParams = {
  game_status: number;
  allowed_games_list: Array<number>;
  join_audit: number;
  quit_audit: number;
  score_mode: number;
};

/**
 * 设置俱乐部房间费设置参数
 */
export type SetClubRoomFeeParams = {
  big_winner_deduction_base: number;
  big_winner_deduction_limit: number;
};

/**
 * 设置俱乐部游戏配置参数
 */
export type SetClubGameConfigCommonParams = {
  deduction_opts: number;
  create_room_type: number;
  allow_chat: number;
  dissolve_limit: number;
  dissolve_vote_timeout: number;
  room_timeout: number;
};

/**
 * 转让俱乐部参数
 */
export type HandOverClubParams = {
  player_id: number;
};
