import {
  IN_GAME_TYPE,
  RESPONE_RESULT,
  RESPONE_STATUS,
} from "db://assets/Scripts/Enums/enums";

/**
 * 请求返回
 */
export type Result<T> = {
  /**返回编码 */
  code: RESPONE_RESULT;
  /**消息 */
  msg: string;
  /**数据 */
  data?: T;
  /**状态 */
  status?: RESPONE_STATUS;
  /**总条数 */
  total?: number;
  /**每页条数 */
  pageSize?: number;
  /**当前页 */
  current?: number;
};

/**
 * 分页包装数据
 */
export type Pagenation<T> = {
  current: number;
  total: number;
  data: T;
};

/**
 * 游戏重连结果数据
 */
export interface GameReconnectResultData<T> {
  in_game_type: IN_GAME_TYPE;
  game_room_data: T;
}

/**
 * 当前游戏信息
 */
export interface CurrentGameInfo<T> {
  in_game_type: IN_GAME_TYPE;
  game_room_data: T;
}
