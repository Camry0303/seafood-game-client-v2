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
import { LoginRegisterMainUI_Component } from "./Prefabs/LoginRegister/LoginRegisterMainUI_Component";
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
          urls: [
            "Common/CircleLoadingUI",
            "Common/BubbleMessageUI",
            "Common/DicesGameRecordUI",
            "Common/DicesGameRecordItem",
          ],
        },
        // 对话框预设体资源
        {
          assetType: Prefab,
          urls: [
            "Dialog/DialogConfirmSmallUI",
            "Dialog/DialogMiniKeyboardUI",
            "Dialog/DialogInputUI",
            "Dialog/DialogMessageUI",
          ],
        },
        // 登录注册预设体资源
        {
          assetType: Prefab,
          urls: [
            "LoginRegister/LoginRegisterMainUI",
            "LoginRegister/AgreementUI",
            "LoginRegister/PhoneLoginUI",
            "LoginRegister/PhoneRegisterUI",
            "LoginRegister/ResetPasswordUI",
          ],
        },
        // 大厅相关预设体资源
        {
          assetType: Prefab,
          urls: [
            "Plaza/PlazaMainUI",
            "Plaza/PlayerInfoEditUI",
            "Plaza/BindPhoneUI",
            "Plaza/ActivityUI",
            "Plaza/PlazaSettingUI",
            "Plaza/ShareUI",
            "Plaza/InviteUI",
            "Plaza/CustomerServiceUI",
          ],
        },
        // 俱乐部弹窗相关预设体资源
        {
          assetType: Prefab,
          urls: [
            "Club/ClubMainUI",
            "Club/ClubSettingUI",
            "Club/ApplicationUI",
            "Club/MemberManagementUI",
            "Club/MemberListUI",
            "Club/PartnerListUI",
            "Club/PartnerMemberListUI",
            "Club/MemberScoreLogListUI",
            "Club/MemberScoreRankListUI",
            "Club/MyMemberListUI",
          ],
        },
        // 俱乐部组件预设体资源
        {
          assetType: Prefab,
          urls: [
            "Club/ClubToggle",
            "Club/ApplicationItem",
            "Club/MemberManagementItem",
            "Club/MemberListItem",
            "Club/PartnerListItem",
            "Club/PartnerMemberListItem",
            "Club/MemberScoreLogListItem",
            "Club/MemberScoreRankListItem",
            "Club/MyMemberListItem",
            "Club/GameTable",
          ],
        },
        // 游戏设置相关预设体资源
        {
          assetType: Prefab,
          urls: ["GameSetting/GameSettingUI"],
        },
        // 骰子游戏房间相关预设体资源
        {
          assetType: Prefab,
          urls: [
            "DicesGame/DicesGameMainUI",
            "DicesGame/DicesGameHelpUI",
            "DicesGame/DicesGameSoundSettingUI",
            "DicesGame/DicesGameDialogConfirmSmallUI",
            "DicesGame/DicesGameOrderDetailsUI",
            "DicesGame/DicesGameOrderDetailsItem",
            "DicesGame/DicesGameOrderItem",
            "DicesGame/DicesGameHistoryUI",
            "DicesGame/DicesGameHistoryItem",
            "DicesGame/DicesGameChip",
            "DicesGame/DicesGameResults",
            "DicesGame/DicesGameSettlementUI",
            "DicesGame/DicesGameSettlementItem",
            "DicesGame/DicesGameFinalSettlementUI",
            "DicesGame/DicesGameFinalSettlementItem",
          ],
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
          urls: [
            "DicesGame/dices/dices0_atlas",
            "DicesGame/chips/chips_atlas",
            "DicesGame/icons/icons0_atlas",
            "DicesGame/icons/small_icon0_atlas",
          ],
        },
        // 内置头像资源
        {
          assetType: ImageAsset,
          urls: [
            "Common/default_avatar_01",
            ...Array.from({ length: 40 }).map((_, i) => {
              return `Avatars/avatar_${i.toString().padStart(3, "0")}`;
            }),
          ],
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
          urls: ["BGM/bgm_00", "BGM/bgm_01", "BGM/bgm_02"],
        },
        {
          assetType: AudioClip,
          urls: ["Effects/Common/ui_click"],
        },
        // 骰子游戏相关音效资源
        {
          assetType: AudioClip,
          urls: [
            "Effects/DicesGame/chips_place",
            "Effects/DicesGame/count_douwn",
            "Effects/DicesGame/result_0_1",
            "Effects/DicesGame/result_0_2",
            "Effects/DicesGame/result_0_3",
            "Effects/DicesGame/result_0_4",
            "Effects/DicesGame/result_0_5",
            "Effects/DicesGame/result_0_6",
            "Effects/DicesGame/result_open",
            "Effects/DicesGame/shake_cup",
            "Effects/DicesGame/start_order",
            "Effects/DicesGame/stop_order",
          ],
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
              name: "bgm_01",
              url: "BGM/bgm_01",
            },
            {
              name: "bgm_02",
              url: "BGM/bgm_02",
            },
            {
              name: "button_ui_click",
              url: "Effects/Common/ui_click",
            },
            {
              name: "chips_place",
              url: "Effects/DicesGame/chips_place",
            },
            {
              name: "count_douwn",
              url: "Effects/DicesGame/count_douwn",
            },
            {
              name: "result_0_1",
              url: "Effects/DicesGame/result_0_1",
            },
            {
              name: "result_0_2",
              url: "Effects/DicesGame/result_0_2",
            },
            {
              name: "result_0_3",
              url: "Effects/DicesGame/result_0_3",
            },
            {
              name: "result_0_4",
              url: "Effects/DicesGame/result_0_4",
            },
            {
              name: "result_0_5",
              url: "Effects/DicesGame/result_0_5",
            },
            {
              name: "result_0_6",
              url: "Effects/DicesGame/result_0_6",
            },
            {
              name: "result_open",
              url: "Effects/DicesGame/result_open",
            },
            {
              name: "shake_cup",
              url: "Effects/DicesGame/shake_cup",
            },
            {
              name: "start_order",
              url: "Effects/DicesGame/start_order",
            },
            {
              name: "stop_order",
              url: "Effects/DicesGame/stop_order",
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

    // 正式：挂载登录注册界面
    ComponentManager.Instance.renderUiNode<LoginRegisterMainUI_Component>(
      "LoginRegisterMainUI",
      "Prefabs",
      "LoginRegister/LoginRegisterMainUI",
      LoginRegisterMainUI_Component,
    );

    // // NOTE - 测试：挂载主界面
    // ComponentManager.Instance.renderUiNode<MainUI_Component>(
    //   "MainUI",
    //   "Prefabs",
    //   "Entrance/MainUI",
    //   MainUI_Component,
    // );

    console.log("挂载登陆界面成功！");
  }
}
