import { _decorator, Component, game, Game as CCGame, Asset } from "cc";
import { ResourceManager } from "./Runtime/ResourceManager";
import { ComponentManager } from "./Runtime/ComponentManager";
import { Game } from "./UiScripts/Game";
import { SoundsManager } from "./Runtime/SoundsManager";
import { HotUpdateUI_Component } from "./UiScripts/Prefabs/Entrance/HotUpdateUI_Component";
import SocketManager from "./Network/SocketIo/SocketManager";
import NativeAPI from "./Utils/NativeAPI";
import { GlobalData } from "./Runtime/GlobalData";
import { DicesGameMainUI_Component } from "./UiScripts/Prefabs/DicesGame/DicesGameMainUI_Component";
import DicesGameEvents from "./Network/SocketIo/DicesGameEvents";
const { ccclass, property } = _decorator;

/**
 * 游戏启动类
 */
@ccclass("GameLanch")
export class GameLanch extends Component {
  @property({ type: Asset, tooltip: "热更Manifest文件" })
  Manifest: Asset = null;

  /**
   * 初始化游戏框架的各个模块
   */
  protected onLoad(): void {
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
    console.log(`初始化模块完成！`);
  }

  /**
   * 游戏启动周期函数
   */
  protected start(): void {
    // 游戏初始化热更新组件
    console.log("处理热更新界面，挂载热更新界面组件！");
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
    game.on(CCGame.EVENT_HIDE, function () {
      console.log(`游戏进入后台！`);
      // 暂停游戏
      game.pause();
    });
  }

  /**
   * 监听游戏回到前台事件
   */
  private listenGameShowEvent() {
    game.on(CCGame.EVENT_SHOW, () => {
      console.log("游戏回到前台");
      // 恢复游戏
      game.resume();
    });

    CCGame.EVENT_RESUME;
  }

  /**
   * 监听游戏恢复事件
   */
  private listenGameResumeEvent() {
    game.on(CCGame.EVENT_RESUME, () => {
      console.log("在此处理恢复逻辑（如恢复音效、动画等）");
    });
  }

  /**
   * 监听游戏暂停事件
   */
  private listenGamePauseEvent() {
    game.on(CCGame.EVENT_PAUSE, () => {
      console.log("在此处理暂停逻辑（如暂停音效、动画等）");
      // 判断socket是否连接
      if (SocketManager.Instance.SocketInstance?.connected) {
        const [dicesGameNode, dicesGameComponent] =
          ComponentManager.Instance.getNodeComponent(
            "DicesGameMainUI",
            DicesGameMainUI_Component,
          );
        // 判断是否在骰子游戏场景
        if (dicesGameNode && dicesGameComponent) {
          // 判断是否在俱乐部
          const club = GlobalData.Instance.getCurrentClubInfoDetail();
          if (club) {
            // 请求俱乐部骰子游戏状态数据
            DicesGameEvents.getClubGamingStatus();
          } else {
            // // 请求大厅骰子游戏状态数据
            // DicesGameEvents.getHallGamingStatus();
          }
        }
      }
    });
  }
}
