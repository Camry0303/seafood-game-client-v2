/**
 * 俱乐部
 */
export type Club = {
  /**
   * 俱乐部id
   */
  club_id: number;

  /**
   * 俱乐部名称
   */
  club_name: string;

  /**
   * 玩家数量
   */
  player_num: number;

  /**
   * 在线玩家数量
   */
  online_player_num: number;

  /**
   * 群主id
   */
  owner_id: number;

  /**
   * 群主昵称
   */
  owner_nickname: string;

  /**
   * 群主头像
   */
  owner_avatar: string;

  /**
   * 玩家角色 0:管理员,1:副管理员;2:合伙人;3:成员;4:机器人
   */
  role?: number;

  /**
   * 是否有未读消息 0:没有;1:有;
   */
  has_hint?: number;

  /**
   * 创建时间
   */
  created_time?: Date | null;
};

/**
 * 俱乐部信息详情
 */
export type ClubDetail = {
  /**
   * 俱乐部id
   */
  club_id: number;

  /**
   * 俱乐部名称
   */
  club_name: string;

  /**
   * 公告
   */
  announcement: string;

  /**
   * 关闭未开始的房间时间:单位秒;
   */
  room_timeout: number;

  /**
   * 申请解散游戏次数限制 0:不限制;单位次;
   */
  dissolve_limit: number;

  /**
   * 解散游戏投票超时时间:单位秒
   */
  dissolve_vote_timeout: number;

  /**
   * 加入需要审核:0:不需要;1:需要;
   */
  join_audit: number;

  /**
   * 退出需要审核:0:不需要;1:需要;
   */
  quit_audit: number;

  /**
   * 群主id
   */
  owner_id: number;

  /**
   * 创建人id
   */
  creator_id: number;

  /**
   * 申请加入提示
   */
  join_apply_hint: number;

  /**
   * 申请退出提示
   */
  quit_apply_hint: number;

  /**
   * 玩家数量
   */
  player_num: number;

  /**
   * 在线玩家数量
   */
  online_player_num: number;
};
