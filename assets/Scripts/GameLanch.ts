import { Logger } from "./Utils/Logger";
import { _decorator, Component, game, Game as CCGame, Asset } from "cc";
import { ResourceManager } from "./Runtime/ResourceManager";
import { ComponentManager } from "./Runtime/ComponentManager";
import { Game } from "./UiScripts/Game";
import { SoundsManager } from "./Runtime/SoundsManager";
import { HotUpdateUI_Component } from "./UiScripts/Prefabs/Entrance/HotUpdateUI_Component";
import SocketManager from "./Network/SocketIo/SocketManager";
import NativeAPI from "./Utils/NativeAPI";
import BaseEvents from "./Network/SocketIo/BaseEvents";
import PlazaEvents from "./Network/SocketIo/PlazaEvents";
const { ccclass, property } = _decorator;

/**
 * 游戏启动类
 */
@ccclass("GameLanch")
export class GameLanch extends Component {
  /**
   * 后台停留超过该时长（毫秒）则强制重连，用于规避"假连接"
   */
  private static readonly FORCE_RECONNECT_THRESHOLD = 30 * 1000;

  @property({ type: Asset, tooltip: "热更Manifest文件" })
  Manifest: Asset = null;

  /**
   * 进入后台的时间戳
   */
  private _hideTimestamp: number = 0;

  /**
   * 初始化游戏框架的各个模块
   */
  protected onLoad(): void {
    // 注册"连接恢复后"的业务恢复回调（拉取房间状态等）
    BaseEvents.setOnReconnectedCallback(() => {
      PlazaEvents.resumeAfterReconnect();
    });
    // 监听游戏进入后台事件
    this.listenGameHideEvent();
    // 监听游戏暂停事件
    this.listenGamePauseEvent();
    // 监听游戏回到前台事件
    this.listenGameShowEvent();
    // 监听游戏恢复事件
    this.listenGameResumeEvent();

    // 添加游戏资源管理模块
    this.node.addComponent(ResourceManager);
    // 添加组件脚本管理模块
    this.node.addComponent(ComponentManager);
    // 添加游戏音频管理模块
    this.node.addComponent(SoundsManager);
    // 添加游戏Socket连接管理模块
    this.node.addComponent(SocketManager);

    // 添加其他模块...

    // 注册全局原生API类
    //@ts-ignore
    window.NativeAPI = NativeAPI;

    // 初始化游戏入口模块
    this.node.addComponent(Game);
    Logger.log(`初始化模块完成！`);
  }

  /**
   * 游戏启动周期函数
   */
  protected start(): void {
    // 游戏初始化热更新组件
    Logger.log("处理热更新界面，挂载热更新界面组件！");
    const hotUpdateUiNode = this.node.getChildByName("HotUpdateUI");
    let hotUpdateUiComponent: HotUpdateUI_Component;
    if (hotUpdateUiNode) {
      hotUpdateUiComponent = hotUpdateUiNode.addComponent(
        HotUpdateUI_Component,
      );
      hotUpdateUiComponent.setManifest(this.Manifest);
    }
  }

  /**
   * 监听游戏进入后台事件
   */
  private listenGameHideEvent() {
    game.on(CCGame.EVENT_HIDE, () => {
      Logger.log(`游戏进入后台！`);
      // 记录进入后台的时间，用于回前台判断是否需要强制重连
      // NOTE - 必须用箭头函数，否则 this 不是组件实例，无法写入 _hideTimestamp
      this._hideTimestamp = Date.now();
      // 暂停游戏
      game.pause();
    });
  }

  /**
   * 监听游戏回到前台事件
   */
  private listenGameShowEvent() {
    game.on(CCGame.EVENT_SHOW, () => {
      Logger.log("游戏回到前台");
      // 恢复游戏
      game.resume();
      // 后台期间 socket.io 的心跳与重连定时器被系统挂起，
      // 回前台需主动检测并恢复连接与业务数据
      this.handleNetworkOnResume();
    });
  }

  /**
   * 回到前台后的网络恢复处理
   */
  private handleNetworkOnResume() {
    // 未登录（无 token）无需处理
    if (!ComponentManager.Instance.getDataFromStorage("token")) {
      return;
    }
    const socket = SocketManager.Instance;
    if (!socket?.SocketInstance) {
      return;
    }

    const duration = Date.now() - this._hideTimestamp;
    if (
      duration > GameLanch.FORCE_RECONNECT_THRESHOLD ||
      !socket.isConnected()
    ) {
      // 后台过久或当前未连接：强制重连（"假连接"也必须走这里重建）
      Logger.log(`回到前台，后台时长 ${duration}ms，强制重连！`);
      socket.forceReconnect();
      return;
    }

    // 连接仍正常：只需刷新业务数据
    PlazaEvents.resumeAfterReconnect();
  }

  /**
   * 监听游戏恢复事件
   */
  private listenGameResumeEvent() {
    game.on(CCGame.EVENT_RESUME, () => {
      Logger.log("在此处理恢复逻辑（如恢复音效、动画等）");
    });
  }

  /**
   * 监听游戏暂停事件
   */
  private listenGamePauseEvent() {
    game.on(CCGame.EVENT_PAUSE, () => {
      Logger.log("在此处理暂停逻辑（如暂停音效、动画等）");
      // NOTE - 原先在此请求游戏状态（getClubGamingStatus），时机错误：
      // 切后台瞬间网络即将中断，请求既发不出也收不回。
      // 已改为回到前台且连接恢复后，由 PlazaEvents.resumeAfterReconnect() 统一拉取。
    });
  }
}
