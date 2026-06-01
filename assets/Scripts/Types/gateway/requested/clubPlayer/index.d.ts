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

/**
 * 修改成员分数参数
 */
export type ChangeClubPlayerScoreParams = {
  player_id: number;
  score: number;
};

/**
 * 降职或删除成员参数
 */
export type DemoteOrDeleteMemberParams = {
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
 * 获取成员列表参数
 */
export type GetMemberListParams = GetMemberManagementListParams;

/**
 * 获取合伙人列表参数
 */
export type GetPartnerListParams = {
  current: number;
  pageSize: number;
  nickname_or_id?: string;
};

/**
 * 添加合伙人参数
 */
export type AddPartnerParams = {
  player_id: number;
};

/**
 * 删除合伙人参数
 */
export type DeletePartnerParams = {
  player_id: number;
};

/**
 * 获取合伙人成员列表参数
 */
export type GetPartnerMemberListParams = {
  belong_partner_id: number;
  current: number;
  pageSize: number;
  nickname_or_id?: string;
};

/**
 * 添加合伙人成员参数
 */
export type AddPartnerMemberParams = {
  belong_partner_id: number;
  player_id: number;
};

/**
 * 删除合伙人成员参数
 */
export type DeletePartnerMemberParams = {
  player_id: number;
};

/**
 * 获取俱乐部玩家上下分日志列表参数
 */
export type GetClubPlayerScoreLogListParams = {
  current: number;
  pageSize: number;
  nickname_or_id?: string;
  type?: number;
};

/**
 * 获取俱乐部玩家积分排名列表参数
 */
export type GetClubPlayerScoreRankListParams = {
  current: number;
  pageSize: number;
};
