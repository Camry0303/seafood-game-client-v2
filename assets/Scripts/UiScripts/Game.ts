import {
  Asset,
  AudioClip,
  ImageAsset,
  Prefab,
  SpriteAtlas,
  _decorator,
} from "cc";
import { SingletonComponent } from "../Common/SingletonComponent";
import { Config, ResMgr } from "../Types/typing";
import { ResourceManager } from "../Runtime/ResourceManager";
import { ComponentManager } from "../Runtime/ComponentManager";
import { SoundsManager } from "../Runtime/SoundsManager";
import { HotUpdateUI_Component } from "./Prefabs/Entrance/HotUpdateUI_Component";
import { LoginRegisterUI_Component } from "./Prefabs/LoginRegister/LoginRegisterUI_Component";
import { MainUI_Component } from "./Prefabs/Entrance/MainUI_Component";
import CommonDailogHandler from "../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "./Prefabs/Common/CircleLoadingUI_Component";

/**
 * 游戏主脚本
 */
// @ccclass('Game')
export class Game extends SingletonComponent {
  // 单例
  static get Instance() {
    return super.GetInstance<Game>();
  }

  protected onLoad(): void {
    // 单例模式代码
    if (Game.GetInstance() === null) {
      Game.SetInstance(this);
    } else {
      this.destroy();
    }
  }

  start() {}

  update(deltaTime: number) {}

  /**
   * 进入游戏逻辑
   */
  public startGame(hotUpdateUiComponent: HotUpdateUI_Component): void {
    console.log("进入游戏逻辑！");
    console.log("开始加载资源包！");

    // 配置资源包信息列表
    const resPkgs: ResMgr.ResourcePackage<Asset> = {
      // 预设体资源包
      Prefabs: [
        // 入口预设体资源
        {
          assetType: Prefab,
          urls: ["Entrance/HotUpdateUI", "Entrance/MainUI"],
        },
        // 公用预设体资源
        {
          assetType: Prefab,
          urls: ["Common/CircleLoadingUI", "Common/BubbleMessageUI"],
        },
        // 对话框预设体资源
        {
          assetType: Prefab,
          urls: [],
        },
        // 登录注册预设体资源
        {
          assetType: Prefab,
          urls: [],
        },
        // 大厅相关预设体资源
        {
          assetType: Prefab,
          urls: [],
        },
        // 俱乐部相关预设体资源
        {
          assetType: Prefab,
          urls: [],
        },
        // 俱乐部组件预设体资源
        {
          assetType: Prefab,
          urls: [],
        },
        // 游戏设置相关预设体资源
        {
          assetType: Prefab,
          urls: [],
        },
        // 潮汕麻将游戏房间相关预设体资源
        {
          assetType: Prefab,
          urls: [],
        },
        // 组件相关预设体资源
        {
          assetType: Prefab,
          urls: [],
        },
      ],
      // 图片资源包
      Images: [
        // 背景图片资源
        {
          assetType: ImageAsset,
          urls: [],
        },
        // Atlas资源
        {
          assetType: SpriteAtlas,
          urls: [],
        },
        // 内置头像资源
        {
          assetType: ImageAsset,
          urls: [],
        },
        // 俱乐部相关
        {
          assetType: ImageAsset,
          urls: [],
        },
      ],
      // 声音资源包
      Sounds: [
        {
          assetType: AudioClip,
          urls: ["BGM/bgm_00"],
        },
        {
          assetType: AudioClip,
          urls: ["Effects/Common/ui_click"],
        },
        {
          assetType: AudioClip,
          urls: [],
        },
      ],
    };

    // 预加载所有资源
    ResourceManager.Instance.preloadResourcePackages(
      resPkgs,
      (loadedCount: number, totalCount: number, detail: string) => {
        const progress = (loadedCount + 1) / totalCount;
        hotUpdateUiComponent?.setProgress(progress >= 1 ? 1 : progress);
        hotUpdateUiComponent?.setLoadingText("加载游戏资源中...");
        hotUpdateUiComponent?.setLoadingDetailsText(
          `进度:${loadedCount + 1}/${totalCount} ${detail}`,
        );
        // console.log(`${loadedCount}/${totalCount}`);
      },
      () => {
        console.log("资源包加载完成！");
        hotUpdateUiComponent?.setProgress(1);
        hotUpdateUiComponent?.setLoadingText("加载完！");
        hotUpdateUiComponent?.setLoadingDetailsText(`正在初始化游戏界面！`);

        // 构建音频资源映射
        const soundsMap: Config.SoundsMap = {
          Sounds: [
            {
              name: "bgm_00",
              url: "BGM/bgm_00",
            },
            {
              name: "button_ui_click",
              url: "Effects/Common/ui_click",
            },
          ],
        };
        // 映射音频资源
        SoundsManager.Instance.mapAudioClips(soundsMap);
        // 设置全局按钮音效
        SoundsManager.Instance.setGlobalButtonEffect("button_ui_click", [
          "_NoEffect",
        ]);

        // 进入游戏场景
        this.enterGameScene();
      },
    );
  }

  /**
   * 进入游戏场景
   */
  public enterGameScene(): void {
    console.log("进入游戏场景");
    ComponentManager.Instance.destroyNodeByName("HotUpdateUI");
    console.log("热更新界面销毁成功！");

    // // 正式：挂载登录注册界面
    // ComponentManager.Instance.renderUiNode<LoginRegisterUI_Component>(
    //   "LoginRegisterUI",
    //   "Prefabs",
    //   "LoginRegister/LoginRegisterUI",
    //   LoginRegisterUI_Component,
    // );

    //NOTE - 测试：挂载主界面
    ComponentManager.Instance.renderUiNode<MainUI_Component>(
      "MainUI",
      "Prefabs",
      "Entrance/MainUI",
      MainUI_Component,
    );

    console.log("挂载登陆界面成功！");
  }
}
