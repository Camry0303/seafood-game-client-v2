import { GAME_ROOM_STATUS } from "db://assets/Scripts/Enums";

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
 * 游戏玩家桌面UI数据
 */
export interface GamePlayerTableUiData {
  /**
   * 玩家id
   */
  player_id: number;
  /**
   * 玩家头像
   */
  avatar: string;
}

/**
 * 骰子游戏桌面UI数据
 */
export interface DicesGameRoomTableUiData {
  /**
   * 俱乐部id
   */
  club_id?: number;

  /**
   * 房间id
   */
  room_id: number;

  /**
   * 创建者id
   */
  creator_id: number;

  /**
   * 群主id
   */
  club_owner_id: number;

  /**
   * 房间状态
   */
  status: GAME_ROOM_STATUS;

  /**
   * 骰子游戏配置
   */
  game_config: DicesGameConfig;

  /**
   * 玩家列表
   */
  players_list: GamePlayerTableUiData[];
}
