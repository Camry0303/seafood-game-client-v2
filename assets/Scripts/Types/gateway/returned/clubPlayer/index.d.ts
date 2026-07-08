/**
 * 俱乐部玩家信息
 */
export type ClubPlayer = {
  /**
   * 俱乐部id
   */
  club_id: number;

  /**
   * 玩家id
   */
  player_id: number;

  /**
   * 玩家昵称
   */
  nickname: string;

  /**
   * 玩家头像
   */
  avatar: string;

  /**
   * 玩家所在俱乐部积分
   */
  club_score: number;

  /**
   * 玩家所在俱乐部每日积分(每日清零)
   */
  daily_score: number;

  /**
   * 前天结算积分
   */
  tdby_settlement_score: number;

  /**
   * 昨天结算积分
   */
  yday_settlement_score: number;

  /**
   * 今天结算积分
   */
  tday_settlement_score: number;

  /**
   * 游戏权限:0:禁止游戏;1:允许游戏
   */
  game_permit: number;

  /**
   * 积分限制:0:无限制;不等于0为限制分数
   */
  score_limit: number;

  /**
   * 玩家所在俱乐部角色 0:管理员,1:副管理员;2:合伙人;3:成员;4:机器人
   */
  role: number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 加入时间
   */
  join_time: Date | null;

  /**
   * 是否在线
   */
  is_online: number;
};
/**
 * 当前俱乐部玩家信息
 */
export type CurrentClubPlayer = {
  /**
   * 俱乐部id
   */
  club_id: number;

  /**
   * 玩家id
   */
  player_id: number;

  /**
   * 玩家昵称
   */
  nickname: string;

  /**
   * 玩家头像
   */
  avatar: string;

  /**
   * 玩家所在俱乐部积分
   */
  club_score: number;

  /**
   * 玩家所在俱乐部每日积分(每日清零)
   */
  daily_score: number;

  /**
   * 游戏权限:0:禁止游戏;1:允许游戏
   */
  game_permit: number;

  /**
   * 积分限制:0:无限制;不等于0为限制分数
   */
  score_limit: number;

  /**
   * 玩家所在俱乐部角色 0:管理员,1:副管理员;2:合伙人;3:成员;4:机器人
   */
  role: number;

  /**
   * 邀请码
   */
  invite_code: string;
};

/**
 * 俱乐部玩家上下分日志
 */
export type ClubPlayerScoreLog = {
  /**
   * 俱乐部id
   */
  club_id: number;

  /**
   * 玩家id
   */
  player_id: number;

  /**
   * 玩家昵称
   */
  nickname: string;

  /**
   * 玩家头像
   */
  avatar: string;

  /**
   * 操作者id
   */
  modifier_id: number;

  /**
   * 操作者昵称
   */
  modifier_nickname: string;

  /**
   * 操作者头像
   */
  modifier_avatar: string;

  /**
   * 操作类型 0:下分 1:上分
   */
  type: number;

  /**
   * 分数
   */
  changed_score: number;

  /**
   * 操作时间
   */
  created_time: string;
};

/**
 * 俱乐部玩家积分排名
 */
export type ClubPlayerScoreRank = {
  /**
   * 俱乐部id
   */
  club_id: number;

  /**
   * 玩家id
   */
  player_id: number;

  /**
   * 玩家昵称
   */
  nickname: string;

  /**
   * 玩家头像
   */
  avatar: string;

  /**
   * 玩家所在俱乐部积分
   */
  club_score: number;

  /**
   * 玩家所在俱乐部每日积分(每日清零)
   */
  daily_score: number;

  /**
   * 前天结算积分
   */
  tdby_settlement_score: number;

  /**
   * 昨天结算积分
   */
  yday_settlement_score: number;

  /**
   * 今天结算积分
   */
  tday_settlement_score: number;

  /**
   * 排名
   */
  rank: number;
};

/**
 * 俱乐部骰子游戏结算数据
 */
export type ClubDicesGameSettlement = {
  /**
   * 俱乐部id
   */
  club_id: number;

  /**
   * 房间id
   */
  room_id: number;

  /**
   * 座位编码
   */
  seat_code: string;

  /**
   * 玩家id
   */
  player_id: number;

  /**
   * 玩家昵称
   */
  nickname: string;

  /**
   * 玩家头像
   */
  avatar: string;

  /**
   * 是否庄家
   */
  is_dealer: boolean;

  /**
   * 是否大赢家
   */
  is_big_winner: boolean;

  /**
   * 是否土豪
   */
  is_rich: boolean;

  /**
   * 人数
   */
  player_count: number;

  /**
   * 局数
   */
  rounds: number;
  /**
   * 总分
   */
  total_score: number;
  /**
   * 每局分数
   */
  score_list: number[];
  /**
   * 日期
   */
  created_date: string;
};
