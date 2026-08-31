import moment from "moment";
import Singleton from "../Common/Singleton";
import { Common, Gateway } from "../Types/typing";
import { game, sys } from "cc";
import CommonDailogHandler from "../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../UiScripts/Prefabs/Common/CircleLoadingUI_Component";
import { ComponentManager } from "./ComponentManager";
import { PlazaMainUI_Component } from "../UiScripts/Prefabs/Plaza/PlazaMainUI_Component";
import { DICE_SKIN } from "../Enums";

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
  public isLocalDev: boolean = false;

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

  //#region 热更新域名
  /**
   * 热更新域名（资源下载根域名 packageUrl），游戏开始后从本地 manifest 读取并存入
   */
  private _hotUpdateDomain: string = "";
  /**
   * 设置热更新域名
   * @param domain
   */
  public setHotUpdateDomain(domain: string) {
    this._hotUpdateDomain = domain || "";
  }
  /**
   * 获取热更新域名
   * @returns
   */
  public getHotUpdateDomain() {
    return this._hotUpdateDomain;
  }
  //#endregion

  //#region 服务器配置信息
  private _serverConfig: Gateway.Returned.Common.ServerConfig | null = null;
  /**
   * 设置服务器配置信息，并自动派生热更新域名（gateway_server_url 的 .gateway. 替换为 .hotupdate.）
   * @param serverConfig
   */
  public setServerConfig(serverConfig: Gateway.Returned.Common.ServerConfig) {
    this._serverConfig = serverConfig;
    this.setHotUpdateDomain(
      this.deriveHotUpdateDomain(serverConfig?.gateway_server_url),
    );
  }
  /**
   * 获取服务器配置信息
   * @returns
   */
  public getServerConfig() {
    return this._serverConfig;
  }
  /**
   * 由 gateway_server_url 派生热更新域名：将首个 ".gateway." 替换为 ".hotupdate."，并将协议升级为 https
   * 例：https://xbxj.gateway.cj33.cn -> https://xbxj.hotupdate.cj33.cn
   *     http://xbxj.gateway.cj33.cn -> https://xbxj.hotupdate.cj33.cn
   * 若不含 ".gateway." 则原样返回（如本地开发 http://localhost，不强制 https）
   * @param gatewayUrl
   */
  public deriveHotUpdateDomain(gatewayUrl?: string): string {
    if (!gatewayUrl) {
      return "";
    }
    const replaced = gatewayUrl.replace(/\.gateway\./, ".hotupdate.");
    // 含 .hotupdate. 的才视为热更域名，协议统一升级为 https
    if (replaced.includes(".hotupdate.")) {
      return replaced.replace(/^http:/, "https:");
    }
    return replaced;
  }
  //#endregion

  //#region 客服信息
  /**
   * 客服信息
   */
  private _customerService: Gateway.Returned.Common.CustomerService | null =
    null;
  /**
   * 设置客服信息
   * @param customerService
   */
  public setCustomerService(
    customerService: Gateway.Returned.Common.CustomerService | null,
  ) {
    this._customerService = customerService;
  }
  /**
   * 获取客服信息
   * @returns
   */
  public getCustomerService() {
    return this._customerService;
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
    const [plazaMainUiNode, plazaMainUiComponent] =
      ComponentManager.Instance.getNodeComponent(
        "PlazaMainUI",
        PlazaMainUI_Component,
      );
    plazaMainUiComponent?.renderPlayerInformation(this._currentPlayerInfo);
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
      // TODO - 响应数据到相应界面
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
  private _currentGameInfo: Gateway.Returned.Common.CurrentGameInfo<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>;

  /**
   * 设置当前游戏信息
   * @param currentGameInfo
   */
  public setCurrentGameInfo<T>(
    currentGameInfo: Gateway.Returned.Common.CurrentGameInfo<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData> | null,
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
   * 默认骰子游戏配置
   */
  private _defaultDicesConfig: Gateway.Returned.Games.DicesGame.DicesGameConfig =
    {
      dice_skin: DICE_SKIN.虎狮骰,
      dice_num: 2,
      score_mode: 1,
      total_game_rounds: 5,
      max_players: 10,
      score_limit: "20000,8000,4000",
      move_limit: 0,
    };
  /**
   * 默认骰子游戏配置
   */
  public get defaultDicesConfig() {
    // 先从本地存储中获取
    const localDataString = this.getDataFromStorage(`defaultDicesConfig`);
    if (localDataString) {
      this._defaultDicesConfig = JSON.parse(
        localDataString,
      ) as Gateway.Returned.Games.DicesGame.DicesGameConfig;
    }
    return this._defaultDicesConfig;
  }
  /**
   * 默认骰子游戏配置
   */
  public set defaultDicesConfig(
    value: Gateway.Returned.Games.DicesGame.DicesGameConfig,
  ) {
    this._defaultDicesConfig = value;
    // 保存到本地存储
    this.setDataToStorage(`defaultDicesConfig`, this._defaultDicesConfig);
  }

  /**
   * 默认俱乐部骰子游戏配置
   */
  private _defaultClubDicesConfig: Gateway.Returned.Games.DicesGame.DicesGameConfig =
    {
      dice_skin: DICE_SKIN.虎狮骰,
      dice_num: 2,
      score_mode: 0,
      total_game_rounds: 5,
      max_players: 10,
      score_limit: "1000,400,200",
      move_limit: 0,
    };
  /**
   * 默认俱乐部骰子游戏配置
   */
  public get defaultClubDicesConfig() {
    // 先从本地存储中获取
    const localDataString = this.getDataFromStorage(`defaultClubDicesConfig`);
    if (localDataString) {
      this._defaultClubDicesConfig = JSON.parse(
        localDataString,
      ) as Gateway.Returned.Games.DicesGame.DicesGameConfig;
    }
    return this._defaultClubDicesConfig;
  }
  /**
   * 默认俱乐部骰子游戏配置
   */
  public set defaultClubDicesConfig(
    value: Gateway.Returned.Games.DicesGame.DicesGameConfig,
  ) {
    this._defaultClubDicesConfig = value;
    // 保存到本地存储
    this.setDataToStorage(
      `defaultClubDicesConfig`,
      this._defaultClubDicesConfig,
    );
  }
  //#endregion

  //#region Socket事件标记

  //#endregion
}
