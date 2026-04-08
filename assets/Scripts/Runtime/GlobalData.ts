import moment from "moment";
import Singleton from "../Common/Singleton";
import { Common, Gateway } from "../Types/typing";
// import { PlazaMainUI_Component } from "../UiScripts/Prefabs/Plaza/PlazaMain/PlazaMainUI_Component";
import { ComponentManager } from "./ComponentManager";
import { game, sys } from "cc";
import { ClubChaoShanMahjongGameRoomData } from "../Types/gateway/returned/games/chaoshanMahjong";
import CommonDailogHandler from "../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../UiScripts/Prefabs/Common/CircleLoadingUI_Component";

/**
 * 全局数据存储
 */
export class GlobalData extends Singleton {
  static get Instance() {
    return super.GetInstance<GlobalData>();
  }

  /**
   * 是否是本地开发环境
   * //NOTE - 切换是否本地开发环境
   */
  public isLocalDev: boolean = true;

  //#region 版本号信息
  /**
   * 版本号信息
   */
  private _versionString: string = "";
  /**
   * 设置版本号信息
   * @param versionString
   */
  public setVersionString(versionString: string) {
    this._versionString = versionString;
  }
  /**
   * 获取版本号信息
   * @returns
   */
  public getVersionString() {
    return this._versionString;
  }
  //#endregion

  //#region 本地存储操作

  /**
   * 数据写入本地存储
   * @param key 数据的key
   * @param data 数据内容
   * @param callback 回调
   */
  public setDataToStorage(key: string, data: unknown, callback?: Function) {
    sys.isNative
      ? sys.localStorage.setItem(key, JSON.stringify(data))
      : localStorage.setItem(key, JSON.stringify(data));
    callback && callback();
  }

  /**
   * 根据key取出本地数据
   * @param key 数据的key
   * @returns
   */
  public getDataFromStorage(key: string) {
    if (key.trim()) {
      return sys.isNative
        ? sys.localStorage.getItem(key)
        : localStorage.getItem(key);
    } else {
      return null;
    }
  }

  /**
   * 根据key清除本地数据
   * @param key 数据的key
   */
  public deleteDataFromStorage(key: string) {
    if (key.trim()) {
      sys.localStorage.removeItem(key);
    }
  }

  /**
   * 清除所有缓存
   */
  public clearDataFromStorage() {
    sys.isNative ? sys.localStorage.clear() : localStorage.clear();
  }

  //#endregion

  //#region 当前玩家信息
  /**
   * 当前玩家信息
   */
  private _currentPlayerInfo: Gateway.Returned.Player.Player | null = null;
  /**
   * 设置当前玩家信息
   * @param playerInfo
   */
  public setCurrentPlayerInfo(
    playerInfo: Gateway.Returned.Player.Player | null,
  ) {
    this._currentPlayerInfo = playerInfo;
    // 响应数据到相应界面
    // const [plazaMainUiNode, plazaMainUiComponent] =
    //   ComponentManager.Instance.getNodeComponent(
    //     "PlazaMainUI",
    //     PlazaMainUI_Component,
    //   );
    // plazaMainUiComponent?.renderPlayerInformation(this._currentPlayerInfo);
  }
  /**
   * 获取当前玩家信息
   * @returns
   */
  public getCurrentPlayerInfo() {
    return this._currentPlayerInfo;
  }
  //#endregion

  //#region 定位相关
  /**
   * 上次知道的位置
   */
  private _lastKnownLocation: Common.Location & {
    lastUpdateTime: moment.Moment;
  } = null;
  /**
   * 设置上次知道的位置
   * @param location
   */
  public setLastKnownLocation(location: Common.Location) {
    this._lastKnownLocation = {
      ...location,
      lastUpdateTime: moment(),
    };
  }
  /**
   * 获取上次已知位置
   * @returns
   */
  public getLastKnownLocation(): Common.Location & {
    lastUpdateTime: moment.Moment;
  } {
    return this._lastKnownLocation;
  }
  /**
   * 获取最新位置
   * @returns
   */
  public async getLatestLocation(): Promise<Common.Location> {
    // 定时器轮询获取最新位置
    let timerId: number;
    // 当前轮询次数
    let times: number = 0;
    return new Promise(function (resolve, reject) {
      timerId = setInterval(async () => {
        if (game.isPaused()) {
          console.log("游戏暂停中，不进行位置获取！");
          return;
        }
        times++;
        console.log("进入定时器轮询获取最新位置！", times);
        if (times > 10) {
          //取消计时器
          GlobalData.Instance.stopGetLocationTimer();
          reject("获取定位超时！请重试！");
        }
        const lastKnownlocation = GlobalData.Instance.getLastKnownLocation();
        if (lastKnownlocation) {
          // 判断上次定位信息是否过期 (有效期5分钟)
          const isExpried =
            moment().diff(lastKnownlocation.lastUpdateTime, "minutes") > 5;

          if (isExpried) {
            GlobalData.Instance.setLastKnownLocation(null);
          } else {
            //取消计时器
            GlobalData.Instance.stopGetLocationTimer();
            // 没有过期，返回最新位置
            resolve({
              latitude: lastKnownlocation.latitude,
              longitude: lastKnownlocation.longitude,
            });
          }
        }
      }, 250);
      GlobalData.Instance.setLocationGetterTimerId(timerId);
    });
  }

  /**
   * 定位轮询定时器id
   */
  private _locationGetterTimerId: number | null = null;
  /**
   * 设置定位轮询定时器id
   * @param timerId
   */
  public setLocationGetterTimerId(timerId: number) {
    this._locationGetterTimerId = timerId;
  }
  /**
   * 获取定位轮询定时器id
   * @returns
   */
  public getLocationGetterTimerId() {
    return this._locationGetterTimerId;
  }
  /**
   * 停止获取位置轮询
   */
  public stopGetLocationTimer() {
    this._locationGetterTimerId && clearInterval(this._locationGetterTimerId);
    this._locationGetterTimerId = null;
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_LOCATION);
  }
  //#endregion

  //#region 俱乐部相关
  /**
   * 当前俱乐部信息
   */
  private _currentClubInfoDetail: Gateway.Returned.Club.ClubDetail | null =
    null;
  /**
   * 设置当前俱乐部信息
   * @param clubInfo
   */
  public setCurrentClubInfoDetail(
    clubInfoDetail: Gateway.Returned.Club.ClubDetail | null,
  ) {
    this._currentClubInfoDetail = clubInfoDetail;
  }
  /**
   * 获取当前俱乐部信息
   * @returns
   */
  public getCurrentClubInfoDetail() {
    return this._currentClubInfoDetail;
  }
  //#endregion

  //#region 俱乐部玩家相关
  /**
   * 当前俱乐部玩家信息
   */
  private _currentClubPlayerInfo: Gateway.Returned.ClubPlayer.CurrentClubPlayer | null =
    null;
  /**
   * 设置当前俱乐部玩家信息
   * @param clubPlayerInfo
   */
  public setCurrentClubPlayerInfo(
    clubPlayerInfo: Gateway.Returned.ClubPlayer.CurrentClubPlayer | null,
  ) {
    this._currentClubPlayerInfo = clubPlayerInfo;
    if (clubPlayerInfo) {
      // 响应数据到相应界面 @TODO
    }
  }
  /**
   * 获取当前俱乐部玩家信息
   * @returns
   */
  public getCurrentClubPlayerInfo() {
    return this._currentClubPlayerInfo;
  }
  //#endregion

  //#region 游戏相关

  /**
   * 当前游戏相关
   */
  private _currentGameInfo: Gateway.Returned.Common.CurrentGameInfo<ClubChaoShanMahjongGameRoomData>;

  /**
   * 设置当前游戏信息
   * @param currentGameInfo
   */
  public setCurrentGameInfo<T>(
    currentGameInfo: Gateway.Returned.Common.CurrentGameInfo<ClubChaoShanMahjongGameRoomData> | null,
  ) {
    this._currentGameInfo = currentGameInfo;
  }

  /**
   * 获取当前游戏信息
   * @returns
   */
  public getCurrentGameInfo<T>() {
    return this._currentGameInfo;
  }

  /**
   * 当前游戏房间信息
   */

  //#endregion

  //#region 默认游戏配置相关

  /**
   * 默认激K游戏配置
   */
  private _defaultJKHoldemConfig: Gateway.Returned.Games.JKHoldem.JKHoldemGameConfig =
    {
      type: 0,
      max_player: 8,
      score_limit_mode: 0,
      total_game_round: 10,
      hidden_cards: 1,
      base_ante: 1,
      max_call: 1,
      wild_aces_mode: 0,
      double_call_at_last: 0,
      straight_flush_call: 0,
      can_all_in: 0,
      can_pass: 0,
      can_check_hidden_cards: 0,
      raise_times: 0,
      raise_times_at_last: 0,
      spectate_mode: 0,
      wait_timeout: 10,
      is_timeout_pass: 0,
      allow_chat: 0,
      anti_cheat: 0,
      location_min_distance: 50,
    };
  /**
   * 默认激K游戏配置
   */
  public get defaultJKHoldemConfig() {
    // 先从本地存储中获取
    const localDataString = this.getDataFromStorage(`defaultJKHoldemConfig`);
    if (localDataString) {
      this._defaultJKHoldemConfig = JSON.parse(
        localDataString,
      ) as Gateway.Returned.Games.JKHoldem.JKHoldemGameConfig;
    }
    return this._defaultJKHoldemConfig;
  }
  /**
   * 默认激K游戏配置
   */
  public set defaultJKHoldemConfig(
    value: Gateway.Returned.Games.JKHoldem.JKHoldemGameConfig,
  ) {
    this._defaultJKHoldemConfig = value;
    // 保存到本地存储
    this.setDataToStorage(`defaultJKHoldemConfig`, this._defaultJKHoldemConfig);
  }

  /**
   * 默认潮汕麻将配置
   */
  private _defaultChaoShanMahjongConfig: Gateway.Returned.Games.ChaoShanMahjong.ChaoShanMahjongGameConfig =
    {
      total_game_round: 4,
      max_player: 4,
      base_score: 1,
      start_dealer: 1,
      dealer_rotation: 1,
      dealer_following: 1,
      winning_streak_mode: 0,
      tiles_pool_type: 0,
      no_caiming_pung_after_pass: 1,
      no_caiming_kong_after_pass: 1,
      drawn_game_settle_kong: 1,
      can_chow_win: 0,
      chow_win_cannot_pass: 0,
      pass_chow_win_rules: 0,
      can_rob_kong_win: 1,
      rob_kong_win_multiple: 2,
      kong_robbed_lose_pay_all: 1,
      can_kong_draw_win: 1,
      can_kong_draw_win_multiple: 2,
      give_kong_lose_pay_all: 1,
      max_lose_score: 0,
      joker_mode: 0,
      no_joker_win_double: 1,
      four_jokers_win: 0,
      four_jokers_win_double: 0,
      horse_type: 1,
      horse_number: 2,
      horse_use_base_score: 0,
      horse_settle_kong_score: 1,
      horse_location: 0,
      horse_pool: 0,
      max_muliple: 0,
      can_chicken_hand: 1,
      chicken_hand_multiple: 1,
      can_all_chows_hand: 1,
      all_chows_hand_multiple: 1,
      can_all_pungs_hand: 1,
      all_pungs_hand_multiple: 2,
      can_mixed_one_suit: 1,
      mixed_one_suit_multiple: 2,
      can_seven_pairs: 1,
      seven_pairs_multiple: 2,
      can_pure_one_suit: 1,
      pure_one_suit_multiple: 4,
      can_mixed_pung: 1,
      mixed_pung_multiple: 4,
      can_great_seven_pairs: 1,
      great_seven_pairs_multiple: 4,
      can_little_three_dragons: 1,
      little_three_dragons_multiple: 4,
      can_little_four_winds: 1,
      little_four_winds_multiple: 8,
      can_pure_pung: 1,
      pure_pung_multiple: 8,
      can_mixed_terminals: 1,
      mixed_terminals_multiple: 4,
      can_mixed_seven_pairs: 0,
      mixed_seven_pairs_multiple: 4,
      can_pure_seven_pairs: 0,
      pure_seven_pairs_multiple: 8,
      can_big_three_dragons: 1,
      big_three_dragons_multiple: 8,
      can_big_four_winds: 1,
      big_four_winds_multiple: 16,
      can_all_honors: 1,
      all_honors_multiple: 16,
      can_pure_terminals: 1,
      pure_terminals_multiple: 16,
      can_heavenly_win: 1,
      heavenly_win_multiple: 16,
      can_earthly_win: 1,
      earthly_win_multiple: 16,
      can_thirteen_orphans: 1,
      thirteen_orphans_multiple: 16,
      can_double_great_seven_pairs: 1,
      double_great_seven_pairs_multiple: 8,
      can_triple_great_seven_pairs: 1,
      triple_great_seven_pairs_multiple: 16,
      can_eighteen_arhats: 1,
      eighteen_arhats_multiple: 16,
      wait_timeout: 10,
      spectate_mode: 0,
      allow_chat: 0,
      anti_cheat: 4,
      location_min_distance: 50,
    };
  /**
   * 默认潮汕麻将配置
   */
  public get defaultChaoShanMahjongConfig() {
    // 先从本地存储中获取
    const localDataString = this.getDataFromStorage(
      `defaultChaoShanMahjongConfig`,
    );
    if (localDataString) {
      this._defaultChaoShanMahjongConfig = JSON.parse(
        localDataString,
      ) as Gateway.Returned.Games.ChaoShanMahjong.ChaoShanMahjongGameConfig;
    }
    return this._defaultChaoShanMahjongConfig;
  }
  /**
   * 默认潮汕麻将配置
   */
  public set defaultChaoShanMahjongConfig(
    value: Gateway.Returned.Games.ChaoShanMahjong.ChaoShanMahjongGameConfig,
  ) {
    this._defaultChaoShanMahjongConfig = value;
    // 保存到本地存储
    this.setDataToStorage(
      `defaultChaoShanMahjongConfig`,
      this._defaultChaoShanMahjongConfig,
    );
  }

  //#endregion

  //#region Socket事件标记

  /**
   * 游戏设置事件返回目标
   */
  public clubGameConfigReturnedTarget: "ToSetting" | "ToCreateRoom";

  //#endregion
}
