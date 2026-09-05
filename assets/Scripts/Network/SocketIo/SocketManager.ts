import { _decorator } from "cc";
import { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { io } from "../../3rd/packages";
import { SingletonComponent } from "../../Common/SingletonComponent";
import BaseEvents from "./BaseEvents";
import CryptoUtils from "../../Utils/CryptoUtils";
import moment from "moment";
import Constants from "../../Common/Constants";
import { GlobalData } from "../../Runtime/GlobalData";
import CommonDailogHandler from "../../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../../UiScripts/Prefabs/Common/CircleLoadingUI_Component";
import PlazaEvents from "./PlazaEvents";
import ClubEvents from "./ClubEvents";
import DicesGameEvents from "./DicesGameEvents";
const { ccclass, property } = _decorator;

/**
 * Socket管理类
 */
export default class SocketManager extends SingletonComponent {
  /**
   * 最大自动重连次数（超出后触发 reconnect_failed）
   */
  private static readonly RECONNECTION_ATTEMPTS = 10;

  /**
   * Socket实例
   */
  public SocketInstance: Socket = null;

  static get Instance() {
    return super.GetInstance<SocketManager>();
  }

  protected onLoad(): void {
    // 单例模式代码
    if (SocketManager.GetInstance() === null) {
      SocketManager.SetInstance(this);
    } else {
      this.destroy();
    }
  }

  /**
   * 初始化socket实例
   */
  private initInstance() {
    if (this.SocketInstance) return;
    // 获取网关服务器地址
    const host = GlobalData.Instance.getServerConfig()?.gateway_server_url;
    // 获取网关服务器端口
    const port = GlobalData.Instance.getServerConfig()?.gateway_server_port;

    const url = `${host}:${port}/main`;

    // 申明socket配置
    const opts: Partial<ManagerOptions & SocketOptions> = {};
    // 配置path
    opts.path = "/socket.io";
    // 设置传输方式:移动端弱网-["websocket", "polling"]-优先 WebSocket 节省流量，失败回退
    opts.transports = ["websocket", "polling"];
    // 设置是否自动连接
    opts.autoConnect = false;
    // 设置是否自动重连
    opts.reconnection = true;
    // 重连退避：1s 起步，最大 5s
    opts.reconnectionDelay = 1000;
    opts.reconnectionDelayMax = 5000;
    // 限定重连次数，超出后触发 reconnect_failed 以便给用户明确提示
    // （不设置则为 Infinity，reconnect_failed 永远不会触发）
    opts.reconnectionAttempts = SocketManager.RECONNECTION_ATTEMPTS;
    // 鉴权信息不在 opts 中指定，改为在 connect() 时赋值到 SocketInstance.auth。
    // 服务端（gateway-service/main-router）只校验签名的 (token,time) 一致性与 token 有效性，
    // 不校验 time 新鲜度，故一次生成的签名可长期复用；重连时 socket.io 自动重发，无需重新签名。
    // 用IO创建一个新的Socket对象并且连接
    this.SocketInstance = io(url, opts);
    // 监听基础事件
    this.setBaseEventsOn();
    // 监听大厅事件
    this.setPlazaEventsOn();
    // 监听俱乐部事件
    this.setClubEventsOn();
    // 监听俱乐部骰子游戏事件
    this.setDicesGameEventsOn();
    // // 监听俱乐部玩家操作事件
    // this.setClubPlayerEventsOn();
  }

  /**
   * 监听基本事件
   */
  public setBaseEventsOn() {
    BaseEvents.setBaseEventsOn(this.SocketInstance);
  }

  /**
   * 取消监听基础事件
   */
  public setBaseEventsOff() {
    BaseEvents.setBaseEventsOff(this.SocketInstance);
  }

  /**
   * 监听大厅事件
   */
  public setPlazaEventsOn() {
    PlazaEvents.setPlazaEventsOn(this.SocketInstance);
  }

  /**
   * 取消监听大厅事件
   */
  public setPlazaEventsOff() {
    PlazaEvents.setPlazaEventsOff(this.SocketInstance);
  }

  /**
   * 监听俱乐部事件
   */
  public setClubEventsOn() {
    ClubEvents.setClubEventsOn(this.SocketInstance);
  }

  /**
   * 取消监听俱乐部事件
   */
  public setClubEventsOff() {
    ClubEvents.setClubEventsOff(this.SocketInstance);
  }

  /**
   * 监听俱乐部骰子游戏事件
   */
  public setDicesGameEventsOn() {
    DicesGameEvents.setDicesGameEventsOn(this.SocketInstance);
  }

  /**
   * 取消监听俱乐部骰子游戏事件
   */
  public setDicesGameEventsOff() {
    DicesGameEvents.setDicesGameEventsOff(this.SocketInstance);
  }

  // /**
  //  * 监听俱乐部玩家操作事件
  //  */
  // public setClubPlayerEventsOn() {
  //   ClubPlayerEvents.setClubPlayerEventsOn(this.SocketInstance);
  // }

  // /**
  //  * 取消监听俱乐部玩家操作事件
  //  */
  // public setClubPlayerEventsOff() {
  //   ClubPlayerEvents.setClubPlayerEventsOff(this.SocketInstance);
  // }

  /**
   * 连接网关socket,尝试登录
   */
  public connect() {
    // 建立连接，登录中
    CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOGIN);

    if (!this.SocketInstance) {
      this.initInstance();
    }
    // 用当前 token 生成一次鉴权信息。
    // 后端不校验 time 新鲜度，签名只要 token 有效即可长期复用；
    // 重连时 socket.io 自动重发已存储的 auth，无需重新签名。
    this.SocketInstance.auth = this.genAuth();
    this.SocketInstance.connect();
  }

  /**
   * 生成鉴权参数（容错：token 可能不存在或格式异常）
   * NOTE - genSignedParams 是泛型方法，必须显式指定类型参数与返回类型，
   * 否则 T 会被推断为 unknown，传给 auth 回调时报 TS2345。
   */
  private genAuth(): Record<string, unknown> {
    let token = null;
    try {
      token = JSON.parse(this.getDataFromStorage("token"));
    } catch (e) {
      token = null;
    }
    return CryptoUtils.genSignedParams<Record<string, unknown>>(
      { token, time: moment().unix() },
      Constants.API_KEY,
    );
  }

  /**
   * 刷新token
   * token 可能已变化（例如重新登录），重新生成鉴权信息赋给 SocketInstance.auth。
   * 注意：仅在 token 实际变化时需要调用；重连本身不需要（socket.io 自动复用旧 auth）。
   */
  public refleshToken() {
    if (!this.SocketInstance) return;
    this.SocketInstance.auth = this.genAuth();
  }

  /**
   * 当前 socket 是否已连接
   */
  public isConnected(): boolean {
    return !!this.SocketInstance?.connected;
  }

  /**
   * 强制重连（先断开再连接）
   * 用于回到前台等场景：后台期间系统挂起 JS，socket.io 的心跳与重连定时器
   * 全部冻结，可能残留 "connected=true 但链路已死" 的假连接，必须主动重建。
   */
  public forceReconnect() {
    if (!this.SocketInstance) {
      this.connect();
      return;
    }
    this.SocketInstance.disconnect();
    this.SocketInstance.connect();
  }

  /**
   * 断开网关socket
   */
  public disconnect() {
    if (this.SocketInstance) {
      this.SocketInstance.disconnect();
    }
  }
}
