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
const { ccclass, property } = _decorator;

/**
 * Socket管理类
 */
export default class SocketManager extends SingletonComponent {
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

      // 初始化socket实例
      SocketManager.Instance.initInstance();
    } else {
      this.destroy();
    }
  }

  /**
   * 初始化socket实例
   */
  private initInstance() {
    if (this.SocketInstance) return;
    // TODO - 改为配置获取
    const host = GlobalData.Instance.isLocalDev
      ? "localhost"
      : "61.164.174.115";
    const port = 18300;

    const url = `${host}:${port}/main`;

    // 申明socket配置
    const opts: Partial<ManagerOptions & SocketOptions> = {};
    // TODO - 改为配置获取 配置path
    opts.path = "/socket.io";
    // 设置传输方式:移动端弱网-["websocket", "polling"]-优先 WebSocket 节省流量，失败回退
    opts.transports = ["websocket", "polling"];
    // 设置是否自动连接
    opts.autoConnect = false;
    // 设置是否自动重连
    opts.reconnection = true;
    // // 设置重连次数
    // opts.reconnectionAttempts = 5;
    // 用IO创建一个新的Socket对象并且连接
    this.SocketInstance = io(url, opts);
    // 监听基础事件
    this.setBaseEventsOn();
    // 监听大厅事件
    this.setPlazaEventsOn();
    // // 监听俱乐部事件
    // this.setClubEventsOn();
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

  // /**
  //  * 监听俱乐部事件
  //  */
  // public setClubEventsOn() {
  //   ClubEvents.setClubEventsOn(this.SocketInstance);
  // }

  // /**
  //  * 取消监听俱乐部事件
  //  */
  // public setClubEventsOff() {
  //   ClubEvents.setClubEventsOff(this.SocketInstance);
  // }

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
    // 处理token
    const token = JSON.parse(this.getDataFromStorage("token"));
    const auth = CryptoUtils.genSignedParams(
      { token, time: moment().unix() },
      Constants.API_KEY,
    );
    this.SocketInstance.auth = auth;
    this.SocketInstance.connect();
  }

  /**
   * 刷新token
   */
  public refleshToken() {
    if (!this.SocketInstance) return;
    const token = JSON.parse(this.getDataFromStorage("token"));
    const auth = CryptoUtils.genSignedParams(
      { token, time: moment().unix() },
      Constants.API_KEY,
    );
    this.SocketInstance.auth = auth;
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
