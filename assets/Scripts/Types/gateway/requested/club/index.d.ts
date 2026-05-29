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
 * 邀请玩家加入俱乐部参数
 */
export type InvitePlayerToClubParams = {
  player_id: number;
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
 * 获取成员列表参数
 */
export type GetMemberListParams = GetMemberManagementListParams;

/**
 * 设置副管理员参数
 */
export type SetSubAdminParams = {
  player_id: number;
};

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
