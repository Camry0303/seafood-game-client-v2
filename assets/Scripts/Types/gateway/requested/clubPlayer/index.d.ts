/**
 * 获取俱乐部玩家列表信息参数
 */
export type GetClubPlayerListParams = {
  current: number;
  pageSize: number;
  player_id?: number;
  nickname?: string;
  remark?: string;
};

/**
 * 修改俱乐部玩家角色参数
 */
export type ChangeClubPlayerRoleParams = {
  player_id: number;
  role: number;
};

/**
 * 修改俱乐部玩家备注参数
 */
export type ChangeClubPlayerRemarkParams = {
  player_id: number;
  remark: string;
};

/**
 * 俱乐部玩家积分变更参数
 */
export type ChangeClubPlayerScoreParams = {
  player_id: number;
  score: number;
};

/**
 * 踢出俱乐部玩家参数
 */
export type KickClubPlayerParams = {
  player_id: number;
};

/**
 * 设置俱乐部玩家分数限制参数
 */
export type SetClubPlayerScoreLimitParams = {
  player_id: number;
  score_limit: number;
};

/**
 * 设置俱乐部玩家游限制限参数
 */
export type SetClubPlayerGamePermitParams = {
  player_id: number;
  game_permit: number;
};
