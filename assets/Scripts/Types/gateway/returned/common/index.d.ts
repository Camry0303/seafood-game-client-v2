import {
  IN_GAME_TYPE,
  RESPONE_RESULT,
  RESPONE_STATUS,
} from "db://assets/Scripts/Enums";

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

/**
 * 服务器配置信息
 */
export interface ServerConfig {
  env: string;
  version: string;
  auth_server_url: string;
  auth_server_port: number;
  gateway_server_url: string;
  gateway_server_port: number;
  is_maintain: boolean;
}

/**
 * 客服信息
 */
export interface CustomerService {
  /**客服微信 */
  wechat_service: string;

  /**客服QQ */
  qq_service: string;

  /**微信二维码地址 */
  wechat_qr_url: string;
}
