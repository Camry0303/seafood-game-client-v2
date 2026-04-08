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
   * 游戏权限:0:禁止游戏;1:允许游戏
   */
  game_permit: number;

  /**
   * 积分限制:0:无限制;不等于0为限制分数
   */
  score_limit: number;

  /**
   * 玩家所在俱乐部角色 0:群主,1:管理员;2:成员;3:机器人
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
   * 玩家所在俱乐部角色 0:群主,1:管理员;2:成员;3:机器人
   */
  role: number;

  /**
   * 邀请码
   */
  invite_code: string;
};
