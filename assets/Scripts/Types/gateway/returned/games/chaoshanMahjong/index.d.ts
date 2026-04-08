import {
  ROOM_COST_DEDUCTION_TYPE,
  GAME_ROOM_STATUS,
} from "db://assets/Scripts/Enums/enums";
import {
  MAHJONG_ACTION_TYPE,
  MELD_ACTION_TYPE,
  MELD_TYPE,
  SEAT_STATUS,
  WIND_DIRECTION,
} from "db://assets/Scripts/Enums/events/clubChaoShanMahjong";

/**
 * 潮汕麻将游戏配置
 */
export interface ChaoShanMahjongGameConfig {
  /**
   * 游戏总局数
   */
  total_game_round: number;

  /**
   * 最大玩家数 2-4人
   */
  max_player: number;

  /**
   * 底分
   */
  base_score: number;

  /**
   * 定庄 0:随机坐庄 1:房主坐庄
   */
  start_dealer: number;

  /**
   * 轮庄 0:赢家坐庄 1:逆时针轮庄
   */
  dealer_rotation: number;

  /**
   * 跟庄 0:否 1:是
   */
  dealer_following: number;

  /**
   * 连庄 0:否 1:是
   */
  winning_streak_mode: number;

  /**
   * 牌池类型 0:整牌136张 1:不带万牌100张 2:不带风牌120张
   */
  tiles_pool_type: number;

  /**
   * 过碰不能碰 0:否 1:是
   */
  no_caiming_pung_after_pass: number;

  /**
   * 过杠不能杠 0:否 1:是
   */
  no_caiming_kong_after_pass: number;

  /**
   * 流局算杠 0:否 1:是
   */
  drawn_game_settle_kong: number;

  /**
   * 可接炮胡 0:否 1:是
   */
  can_chow_win: number;

  /**
   * 必胡 0:否 1:是
   */
  chow_win_cannot_pass: number;

  /**
   * 过胡不胡规则 0:全部不胡 1:同牌不胡 2:同番不胡
   */
  pass_chow_win_rules: number;

  /**
   * 可抢杠胡 0:否 1:是
   */
  can_rob_kong_win: number;

  /**
   * 抢杠胡倍数
   */
  rob_kong_win_multiple: number;

  /**
   * 抢杠承包
   */
  kong_robbed_lose_pay_all: number;

  /**
   * 杠上开花 0:否 1:是
   */
  can_kong_draw_win: number;

  /**
   * 杠上开花倍数
   */
  can_kong_draw_win_multiple: number;

  /**
   * 杠爆承包
   */
  give_kong_lose_pay_all: number;

  /**
   * 分数封顶 0:不封顶 其他值:封顶分数
   */
  max_lose_score: number;

  /**
   * 鬼牌 0:无鬼牌 1:白板做鬼 2:红中做鬼 3:翻鬼 4:翻双鬼
   */
  joker_mode: number;

  /**
   * 无鬼翻倍 0:否 1:是
   */
  no_joker_win_double: number;

  /**
   * 四鬼胡牌 0:否 1:是
   */
  four_jokers_win: number;

  /**
   * 四鬼翻倍 0:否 1:是
   */
  four_jokers_win_double: number;

  /**
   * 马牌 0:不买 1:胡牌买马 2:自摸买马
   */
  horse_type: number;

  /**
   * 买马数
   */
  horse_number: number;

  /**
   * 马跟底分 0:否 1:是
   */
  horse_use_base_score: number;

  /**
   * 马跟杠 0:否 1:是
   */
  horse_settle_kong_score: number;

  /**
   * 中马位置 0:按方位 1:按固定
   */
  horse_location: number;

  /**
   * 马牌牌池 0:剩余牌 1:另一幅牌
   */
  horse_pool: number;

  /**
   * 倍数封顶 0:不封顶 其他值:封顶分数
   */
  max_muliple: number;

  /**
   * 能否鸡胡 0:否 1:是
   */
  can_chicken_hand: number;

  /**
   * 鸡胡倍数
   */
  chicken_hand_multiple: number;

  /**
   * 能否平胡 0:否 1:是
   */
  can_all_chows_hand: number;

  /**
   * 平胡倍数
   */
  all_chows_hand_multiple: number;

  /**
   * 能否碰碰胡 0:否 1:是
   */
  can_all_pungs_hand: number;

  /**
   * 碰碰胡倍数
   */
  all_pungs_hand_multiple: number;

  /**
   * 能否混一色 0:否 1:是
   */
  can_mixed_one_suit: number;

  /**
   * 混一色倍数
   */
  mixed_one_suit_multiple: number;

  /**
   * 能否七小对 0:否 1:是
   */
  can_seven_pairs: number;

  /**
   * 七小对倍数
   */
  seven_pairs_multiple: number;

  /**
   * 能否清一色 0:否 1:是
   */
  can_pure_one_suit: number;

  /**
   * 清一色倍数
   */
  pure_one_suit_multiple: number;

  /**
   * 能否混碰 0:否 1:是
   */
  can_mixed_pung: number;

  /**
   * 混碰倍数
   */
  mixed_pung_multiple: number;

  /**
   * 能否豪华七小对 0:否 1:是
   */
  can_great_seven_pairs: number;

  /**
   * 豪华七小对倍数
   */
  great_seven_pairs_multiple: number;

  /**
   * 能否小三元 0:否 1:是
   */
  can_little_three_dragons: number;

  /**
   * 小三元倍数
   */
  little_three_dragons_multiple: number;

  /**
   * 能否小四喜 0:否 1:是
   */
  can_little_four_winds: number;

  /**
   * 小四喜倍数
   */
  little_four_winds_multiple: number;

  /**
   * 能否清碰 0:否 1:是
   */
  can_pure_pung: number;

  /**
   * 清碰倍数
   */
  pure_pung_multiple: number;

  /**
   * 能否混幺九 0:否 1:是
   */
  can_mixed_terminals: number;

  /**
   * 混幺九倍数
   */
  mixed_terminals_multiple: number;

  /**
   * 能否混七对 0:否 1:是
   */
  can_mixed_seven_pairs: number;

  /**
   * 混七对倍数
   */
  mixed_seven_pairs_multiple: number;

  /**
   * 能否清七对 0:否 1:是
   */
  can_pure_seven_pairs: number;

  /**
   * 清七对倍数
   */
  pure_seven_pairs_multiple: number;

  /**
   * 能否大三元 0:否 1:是
   */
  can_big_three_dragons: number;

  /**
   * 大三元倍数
   */
  big_three_dragons_multiple: number;

  /**
   * 能否大四喜 0:否 1:是
   */
  can_big_four_winds: number;

  /**
   * 大四喜倍数
   */
  big_four_winds_multiple: number;

  /**
   * 能否字一色 0:否 1:是
   */
  can_all_honors: number;

  /**
   * 字一色倍数
   */
  all_honors_multiple: number;

  /**
   * 能否清幺九 0:否 1:是
   */
  can_pure_terminals: number;

  /**
   * 清幺九倍数
   */
  pure_terminals_multiple: number;

  /**
   * 能否天胡 0:否 1:是
   */
  can_heavenly_win: number;

  /**
   * 天胡倍数
   */
  heavenly_win_multiple: number;

  /**
   * 能否地胡 0:否 1:是
   */
  can_earthly_win: number;

  /**
   * 地胡倍数
   */
  earthly_win_multiple: number;

  /**
   * 能否十三幺 0:否 1:是
   */
  can_thirteen_orphans: number;

  /**
   * 十三幺倍数
   */
  thirteen_orphans_multiple: number;

  /**
   * 能否双豪华七小对 0:否 1:是
   */
  can_double_great_seven_pairs: number;

  /**
   * 双豪华七小对倍数
   */
  double_great_seven_pairs_multiple: number;

  /**
   * 能否三豪华七小对 0:否 1:是
   */
  can_triple_great_seven_pairs: number;

  /**
   * 三豪华七小对倍数
   */
  triple_great_seven_pairs_multiple: number;

  /**
   * 能否十八罗汉 0:否 1:是
   */
  can_eighteen_arhats: number;

  /**
   * 十八罗汉倍数
   */
  eighteen_arhats_multiple: number;

  /**
   * 超时托管时间
   */
  wait_timeout: number;

  /**
   * 观战模式 0:不可观战 1:可观战 2:可观战加入
   */
  spectate_mode: number;

  /**
   * 是否互动聊天
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
}

/**
 * 俱乐部潮汕麻将游戏配置
 */
export interface ClubChaoShanMahjongGameConfig extends ChaoShanMahjongGameConfig {
  /**
   * 俱乐部id
   */
  club_id: number;
}

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
 * 俱乐部潮汕麻将游戏房间桌UI数据
 */
export interface GameRoomTableUiData {
  /**
   * 俱乐部id
   */
  club_id: number;
  /**
   * 房间id
   */
  room_id: number;
  /**
   * 创建者id
   */
  creator_id: number;
  /**
   * 俱乐部群主id
   */
  club_owner_id: number;
  /**
   * 房间扣费方式
   */
  deduction_type: ROOM_COST_DEDUCTION_TYPE;
  /**
   * 房间状态
   */
  status: GAME_ROOM_STATUS;
  /**
   * 游戏配置
   */
  game_config: ChaoShanMahjongGameConfig;
  /**
   * 游戏玩家
   */
  players: GamePlayerTableUiData[];
}

/**
 * 俱乐部潮汕麻将游戏房间数据
 */
export interface ClubChaoShanMahjongGameRoomData {
  club_id: number;
  room_id: number;
  creator_id: number;
  club_owner_id: number;
  game_config: ChaoShanMahjongGameConfig;
  deduction_type: ROOM_COST_DEDUCTION_TYPE;
  status: GAME_ROOM_STATUS;
}

/**
 * 面子牌组合 (顺子，刻子，杠子)
 */
export interface MeldedTilesData {
  meld_type: MELD_TYPE;
  tiles_ids: number[];
}

/**
 * 副露牌组合 (顺子，刻子，杠子)
 */
export interface ExposedMeldedTilesData {
  meld_action: MELD_ACTION_TYPE;
  melded_tiles: MeldedTilesData;
  from_wind_direction?: WIND_DIRECTION;
}

/**
 * 等待动作
 */
export interface WaitingActionData {
  type: MAHJONG_ACTION_TYPE;
  melds?: MeldedTilesData[];
}

/**
 * 游戏玩家数据
 */
export interface GamePlayerData {
  club_id: number;
  player_id: number;
  nickname: string;
  avatar: string;
  club_score: number;
  daily_score: number;
  game_permit: number;
  score_limit: number;
  role: number;
  remark: string;
}

/**
 * 游戏座位数据
 */
export interface GameSeatData {
  wind_direction: WIND_DIRECTION;
  is_dealer: boolean;
  hand_tiles_ids: number[];
  exposed_melds: ExposedMeldedTilesData[];
  discards_ids: number[];
  score: number;
  status: SEAT_STATUS;
  player: GamePlayerData | null;
  available: boolean;
}

/**
 * 玩家在线状态变更数据
 */
export interface OnlineStatusChangedData {
  wind_direction: WIND_DIRECTION;
  player_id: number;
  is_online: number;
}

/**
 * 游戏状态数据 // TODO: 添加其他状态数据
 */
export interface GamingStatusgData {
  total_round: number;
  current_round: number;
  status: GAME_ROOM_STATUS;

  dices: number[];
  previous_discard_wind_direction: WIND_DIRECTION | null;
  previous_discard_tile_id: number;

  current_action_wind_direction: WIND_DIRECTION;
  remaining_time: number;
  waiting_actions: WaitingActionData[];

  remaining_tiles_count: number;
  discard_tiles_count: number;

  seats: Record<WIND_DIRECTION, GameSeatData>;
}
