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
   * 游戏状态:0:游戏打烊;1:游戏开张;
   */
  game_status: number;

  /**
   * 玩家数量
   */
  player_num: number;

  /**
   * 在线玩家数量
   */
  online_player_num: number;

  /**
   * 房间数量
   */
  room_count: number;

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
   * 玩家角色 0:群主;1:管理员;2:成员;
   */
  role?: number;

  /**
   * 是否有未读消息 0:没有;1:有;
   */
  has_hint?: number;
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
   * 创建房间方式 0:玩家选择房间规则;1:俱乐部规则;
   */
  create_room_type: number;

  /**
   * 激K游戏配置
   */
  jk_game_setting: string;

  /**
   * 上游游戏配置
   */
  sy_game_setting: string;

  /**
   * 麻将游戏配置
   */
  mj_game_setting: string;

  /**
   * 扣钻方式选项 0:仅AA扣钻;1:仅俱乐部扣钻;2:两者都可选;
   */
  deduction_opts: number;

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
   * 游戏状态:0:游戏打烊;1:游戏开张;
   */
  game_status: number;

  /**
   * 允许的游戏:0:激K;1:上游;2:麻将;例:[0,1,2]
   */
  allowed_games: string;

  /**
   * 加入需要审核:0:不需要;1:需要;
   */
  join_audit: number;

  /**
   * 退出需要审核:0:不需要;1:需要;
   */
  quit_audit: number;

  /**
   * 积分模式:0:日结模式;1:上分模式;
   */
  score_mode: number;

  /**
   * 大赢家抽成分数基数
   */
  big_winner_deduction_base: number;

  /**
   * 大赢家抽成门槛分数
   */
  big_winner_deduction_limit: number;

  /**
   * 是否允许聊天 0:不允许;1:允许;
   */
  allow_chat: number;

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

/**
 * 俱乐部基础配置
 */
export type ClubBaseConfig = {
  game_status: number;
  allowed_games: string;
  join_audit: number;
  quit_audit: number;
  score_mode: number;
};

/**
 * 俱乐部游戏配置
 */
export type ClubGameConfigCommon = {
  deduction_opts: number;
  create_room_type: number;
  allow_chat: number;
  dissolve_limit: number;
  dissolve_vote_timeout: number;
  room_timeout: number;
};
