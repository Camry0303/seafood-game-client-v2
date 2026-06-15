import {
  CLUB_PLAYER_ROLE,
  GAME_ROOM_STATUS,
  IN_GAME_TYPE,
} from "db://assets/Scripts/Enums";
import { DICES_GAME_SEAT_STATUS } from "db://assets/Scripts/Enums/Events/DicesGame";

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

/**
 * 俱乐部骰子游戏房间数据
 */
export interface ClubDicesGameRoomData {
  /**
   * 俱乐部id
   */
  club_id: number;
  /**
   * 房间id
   */
  room_id: number;
  /**
   * 创建人id
   */
  creator_id: number;
  /**
   * 群主id
   */
  club_owner_id: number;
  /**
   * 游戏配置
   */
  game_config: DicesGameConfig;
  /**
   * 房间状态
   */
  status: GAME_ROOM_STATUS;
}

/**
 * 游戏重连结果数据
 */
export interface GameReconnectResultData {
  /**
   * 正在游戏类型
   */
  in_game_type: IN_GAME_TYPE;
  /**
   * 游戏房间数据
   */
  game_room_data: ClubDicesGameRoomData;
}

/**
 * 游戏玩家数据
 */
export interface GamePlayerData {
  /**
   * 俱乐部id
   */
  club_id: number;
  /**
   * 玩家id
   */
  player_id: number;
  /**
   * 昵称
   */
  nickname: string;
  /**
   * 头像
   */
  avatar: string;
  /**
   * 俱乐部分数
   */
  club_score: number;
  /**
   * 每日分数
   */
  daily_score: number;
  /**
   * 角色
   */
  role: CLUB_PLAYER_ROLE;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否在线
   */
  is_online: number;
}

/**
 * 游戏座位数据
 */
export interface GameSeatData {
  /**
   * 座位编号
   */
  seat_code: string;
  /**
   * 是否庄家
   */
  is_dealer: boolean;
  /**
   * 分数
   */
  score: number;
  /**
   * 座位状态
   */
  status: DICES_GAME_SEAT_STATUS;
  /**
   * 玩家
   */
  player: GamePlayerData | null;
  /**
   * 是否可用
   */
  available: boolean;
}

/**
 * 订单数据
 */
export interface OrderData {
  /**
   * 座位编号
   */
  seat_code: string;
  /**
   * 玩家id
   */
  player_id: number;
  /**
   * 下单类型
   */
  order_type: number;
  /**
   * 下单分数
   */
  order_score: number;
  /**
   * 下单结果
   */
  order_result: number | number[];
}

/**
 * 下单返回数据
 */
export interface CreatedOrderResultData extends OrderData {
  /**
   * 当前可用分数
   */
  current_available_score: number;
  /**
   * 当前下单分数统计 [位置-1][单,连(占位),豹]
   */
  current_order_stats: number[][];
  /**
   * 当前连串下单分数统计
   */
  current_combo_order_stats: { [key: number]: number };
  /**
   * 当前挪单统计
   */
  current_move_order_stats: number;
}

/**
 * 游戏状态数据 // TODO: 添加其他状态数据
 */
export interface GamingStatusgData {
  /**
   * 总局数
   */
  total_rounds: number;
  /**
   * 当前局
   */
  current_round: number;
  /**
   * 游戏状态
   */
  status: GAME_ROOM_STATUS;
  /**
   * 剩余时间
   */
  remaining_time: number;
  /**
   * 上局结果
   */
  last_results: number[];
  /**
   * 本局结果
   */
  current_results: number[];
  /**
   * 当前下单分数统计 [位置-1][单,连(占位),豹]
   */
  current_order_stats: number[][];
  /**
   * 当前连串下单分数统计
   */
  current_combo_order_stats: { [key: number]: number };
  /**
   * 当前挪单统计
   */
  current_move_order_stats: number;
  /**
   * 当前订单数据
   */
  current_orders: OrderData[];
  /**
   * 座位列表
   */
  seats: Record<string, GameSeatData>;
}
