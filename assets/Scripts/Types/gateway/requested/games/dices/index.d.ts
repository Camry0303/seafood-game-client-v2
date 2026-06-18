/**
 * 骰子游戏配置
 */
export type DicesGameConfig = {
  /**
   * 骰子数量
   */
  dice_num: number;

  /**
   * 分数模式 [0不可负分,1可负分]
   */
  score_mode: number;

  /**
   * 总局数
   */
  total_game_rounds: number;

  /**
   * 最大玩家数
   */
  max_players: number;

  /**
   * 分数限制 [string格式:"单,连,豹"]
   */
  score_limit: string;

  /**
   * 移动次数限制
   */
  move_limit: number;
};

/**
 * 创建俱乐部骰子游戏房间
 */
export type CreateClubDicesGameRoomParams = DicesGameConfig;

/**
 * 创建公开骰子游戏房间
 */
export type CreatePublicDicesGameRoomParmas = DicesGameConfig;

/**
 * 加入房间参数
 */
export type JoinClubDicesGameRoomParams = {
  /**
   * 房间ID
   */
  room_id: number;
};

/**
 * 观战房间参数
 */
export type SpectateClubDicesGameRoomParams = {
  /**
   * 房间ID
   */
  room_id: number;
};

/**
 * 设置庄家参数
 */
export type SetDealerParams = {
  /**
   * 玩家ID
   */
  player_id: number;
};
