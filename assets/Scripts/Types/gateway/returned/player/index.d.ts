import { IN_GAME_TYPE } from "db://assets/Scripts/Enums";

/**
 * 玩家信息
 */
export type Player = {
  /**
   * id
   */
  id: number;

  /**
   * 昵称
   */
  nickname: string;

  /**
   * 头像
   */
  avatar: string;

  /**
   * 手机号
   */
  phone_number: string;

  /**
   * 积分
   */
  score: number;

  /**
   * 房卡
   */
  room_card: number;

  /**
   * 钻石
   */
  diamond: number;

  /**
   * 礼券
   */
  gift_ticket: number;

  /**
   * 等级
   */
  level: number;

  /**
   * 是否VIP
   */
  is_vip: number;

  /**
   * 是否被封禁
   */
  is_ban: number;

  /**
   * 是否为官方账号
   */
  official: number;

  /**
   * 是否为测试账号
   */
  is_test: number;

  /**
   * 邀请码
   */
  invite_code: number;

  /**
   * 代理id
   */
  agent_id: number;

  /**
   * 代理邀请码
   */
  agent_invite_code: number;

  /**
   * 代理昵称
   */
  agent_nickname: string;

  /**
   * 是否在线
   */
  is_online: number;

  /**
   * 目前所在俱乐部id (登录时返回 考虑在玩家信息变更中更新数据)
   */
  in_club_id: number;

  /**
   * 玩家所在游戏 (登录时返回 考虑在玩家信息变更中更新数据)
   */
  in_game_type: IN_GAME_TYPE;

  /**
   * 目前所在游戏房间id (登录时返回 考虑在玩家信息变更中更新数据)
   */
  in_game_room_id: number;

  /**
   * 目前所在游戏房间座位号 (登录时返回 考虑在玩家信息变更中更新数据)
   */
  in_seat_code: string;
};
