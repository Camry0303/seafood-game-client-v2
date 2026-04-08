/**
 * 激K扑克游戏配置
 */
export type JKHoldemGameConfig = {
  /**
   * 类型：0:潮汕激K 1:港式激K
   */
  type: number;

  /**
   * 最大玩家数（5-8人）
   */
  max_player: number;

  /**
   * 是否限分模式（达到分数限制停止下一局）
   */
  score_limit_mode: number;

  /**
   * 游戏总局数
   */
  total_game_round: number;

  /**
   * 初始底牌数
   */
  hidden_cards: number;

  /**
   * 最小下注分数（底注）
   */
  base_ante: number;

  /**
   * 最大下注分数
   */
  max_call: number;

  /**
   * 百变神A模式
   */
  wild_aces_mode: number;

  /**
   * 最后一轮下注翻倍
   */
  double_call_at_last: number;

  /**
   * 顺子同花叫注
   */
  straight_flush_call: number;

  /**
   * 是否允许Allin
   */
  can_all_in: number;

  /**
   * 是否允许过牌
   */
  can_pass: number;

  /**
   * 是否允许查看底牌
   */
  can_check_hidden_cards: number;

  /**
   * 加注次数
   */
  raise_times: number;

  /**
   * 最后一轮加注次数
   */
  raise_times_at_last: number;

  /**
   * 是否允许观战
   */
  spectate_mode: number;

  /**
   * 等待超时时间
   */
  wait_timeout: number;

  /**
   * 是否超时过牌(需要允许过牌,当值为否时，超时自动弃牌)
   */
  is_timeout_pass: number;

  /**
   * 是否允许聊天
   */
  allow_chat: number;

  /**
   * 防作弊（0:关闭;1:ip监测;3:定位监测;4:ip+定位监测;）
   */
  anti_cheat: number;

  /**
   * 定位最小距离（单位米）
   */
  location_min_distance: number;
};

/**
 * 俱乐部激K扑克游戏配置
 */
export type ClubJKHoldemGameConfig = {
  /**
   * 俱乐部id
   */
  club_id: number;
} & JKHoldemGameConfig;
