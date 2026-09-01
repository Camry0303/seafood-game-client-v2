import { Logger } from "../Utils/Logger";
import {
  Asset,
  AudioClip,
  ImageAsset,
  Prefab,
  SpriteAtlas,
  _decorator,
  game,
} from "cc";
import { SingletonComponent } from "../Common/SingletonComponent";
import { Config, Gateway, ResMgr } from "../Types/typing";
import { ResourceManager } from "../Runtime/ResourceManager";
import { ComponentManager } from "../Runtime/ComponentManager";
import { SoundsManager } from "../Runtime/SoundsManager";
import { HotUpdateUI_Component } from "./Prefabs/Entrance/HotUpdateUI_Component";
import { LoginRegisterMainUI_Component } from "./Prefabs/LoginRegister/LoginRegisterMainUI_Component";
import CommonDailogHandler from "../Utils/CommonDailogHandler";
import HttpApiServices from "../Utils/HttpApiServices";
import { MainUI_Component } from "./Prefabs/Entrance/MainUI_Component";
import { GlobalData } from "../Runtime/GlobalData";

/**
 * 音效清单：url 与播放名一一对应，作为预加载与音频映射的唯一数据源。
 * 新增音效只需在此处添加一项，避免预加载列表与 SoundsMap 两处维护、容易不一致。
 */
const SOUND_LIST: { url: string; name: string }[] = [
  { url: "BGM/bgm_00", name: "bgm_00" },
  { url: "BGM/bgm_01", name: "bgm_01" },
  { url: "BGM/bgm_02", name: "bgm_02" },
  { url: "Effects/Common/ui_click", name: "button_ui_click" },
  { url: "Effects/DicesGame/chips_place", name: "chips_place" },
  { url: "Effects/DicesGame/count_down", name: "count_douwn" },
  { url: "Effects/DicesGame/result_0_1", name: "result_0_1" },
  { url: "Effects/DicesGame/result_0_2", name: "result_0_2" },
  { url: "Effects/DicesGame/result_0_3", name: "result_0_3" },
  { url: "Effects/DicesGame/result_0_4", name: "result_0_4" },
  { url: "Effects/DicesGame/result_0_5", name: "result_0_5" },
  { url: "Effects/DicesGame/result_0_6", name: "result_0_6" },
  { url: "Effects/DicesGame/result_open", name: "result_open" },
  { url: "Effects/DicesGame/shake_cup", name: "shake_cup" },
  { url: "Effects/DicesGame/start_order", name: "start_order" },
  { url: "Effects/DicesGame/stop_order", name: "stop_order" },
];

/** 单个资源分组（一个 assetType 对应一批 urls），Prefabs/Images 的元素类型 */
type ResourceGroup = ResMgr.ResourcePackage<Asset>["Prefabs"][number];

/**
 * 预设体资源清单：按模块拆分为独立常量，便于单独定位维护。
 * 每个模块常量即一个资源分组，新增预设体在对应模块追加 url 即可。
 */
// 入口预设体资源
const PREFAB_ENTRANCE: ResourceGroup = {
  assetType: Prefab,
  urls: ["Entrance/HotUpdateUI", "Entrance/MainUI"],
};
// 公用预设体资源
const PREFAB_COMMON: ResourceGroup = {
  assetType: Prefab,
  urls: [
    "Common/CircleLoadingUI",
    "Common/BubbleMessageUI",
    "Common/DicesGameRecordUI",
    "Common/DicesGameRecordItem",
    "Common/DicesGameReviewUI",
    "Common/DicesGameReviewItem",
  ],
};
// 对话框预设体资源
const PREFAB_DIALOG: ResourceGroup = {
  assetType: Prefab,
  urls: [
    "Dialog/DialogConfirmSmallUI",
    "Dialog/DialogMiniKeyboardUI",
    "Dialog/DialogInputUI",
    "Dialog/DialogMessageUI",
  ],
};
// 登录注册预设体资源
const PREFAB_LOGIN_REGISTER: ResourceGroup = {
  assetType: Prefab,
  urls: [
    "LoginRegister/LoginRegisterMainUI",
    "LoginRegister/AgreementUI",
    "LoginRegister/PhoneLoginUI",
    "LoginRegister/PhoneRegisterUI",
    "LoginRegister/ResetPasswordUI",
  ],
};
// 大厅相关预设体资源
const PREFAB_PLAZA: ResourceGroup = {
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
};
// 俱乐部弹窗相关预设体资源
const PREFAB_CLUB_DIALOGS: ResourceGroup = {
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
};
// 俱乐部组件预设体资源
const PREFAB_CLUB_COMPONENTS: ResourceGroup = {
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
};
// 游戏设置相关预设体资源
const PREFAB_GAME_SETTING: ResourceGroup = {
  assetType: Prefab,
  urls: ["GameSetting/GameSettingUI"],
};
// 骰子游戏房间相关预设体资源
const PREFAB_DICES_GAME: ResourceGroup = {
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
    "DicesGame/DicesGameRobotUI",
    "DicesGame/DicesGameRobotItem",
  ],
};

/** 预设体资源包：汇总各模块常量（顺序即加载顺序） */
const PREFAB_PACKAGES: ResMgr.ResourcePackage<Asset>["Prefabs"] = [
  PREFAB_ENTRANCE,
  PREFAB_COMMON,
  PREFAB_DIALOG,
  PREFAB_LOGIN_REGISTER,
  PREFAB_PLAZA,
  PREFAB_CLUB_DIALOGS,
  PREFAB_CLUB_COMPONENTS,
  PREFAB_GAME_SETTING,
  PREFAB_DICES_GAME,
];

/**
 * 图片资源清单：按用途拆分为独立常量，便于单独定位维护。
 */
// Atlas资源
const IMAGE_ATLAS: ResourceGroup = {
  assetType: SpriteAtlas,
  urls: [
    "DicesGame/dices/dices0_atlas",
    "DicesGame/chips/chips_atlas",
    "DicesGame/icons/icons0_atlas",
    "DicesGame/icons/small_icon0_atlas",
  ],
};
// 内置头像资源
const IMAGE_AVATARS: ResourceGroup = {
  assetType: ImageAsset,
  urls: [
    "Common/default_avatar_01",
    ...Array.from({ length: 40 }).map((_, i) => {
      return `Avatars/avatar_${i.toString().padStart(3, "0")}`;
    }),
  ],
};

/** 图片资源包：汇总各用途常量 */
const IMAGE_PACKAGES: ResMgr.ResourcePackage<Asset>["Images"] = [
  IMAGE_ATLAS,
  IMAGE_AVATARS,
];

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
  public startGame(hotUpdateUiComponent: HotUpdateUI_Component) {
    Logger.log("进入游戏逻辑！");

    // 配置资源包信息列表（Prefabs/Images 由模块级常量统一维护，Sounds 由 SOUND_LIST 派生）
    const resPkgs: ResMgr.ResourcePackage<Asset> = {
      Prefabs: PREFAB_PACKAGES,
      Images: IMAGE_PACKAGES,
      // 声音资源包（url 由 SOUND_LIST 统一提供，避免与音频映射两处维护）
      Sounds: [
        {
          assetType: AudioClip,
          urls: SOUND_LIST.map((s) => s.url),
        },
      ],
    };
    // 预加载所有资源
    Logger.log("开始加载资源包！");
    ResourceManager.Instance.preloadResourcePackages(
      resPkgs,
      (loadedCount: number, totalCount: number, detail: string) => {
        const progress = totalCount > 0 ? loadedCount / totalCount : 1;
        hotUpdateUiComponent?.setProgress(progress >= 1 ? 1 : progress);
        hotUpdateUiComponent?.setLoadingText("加载游戏资源中...");
        hotUpdateUiComponent?.setLoadingDetailsText(
          `进度:${loadedCount}/${totalCount} ${detail}`,
        );
      },
      async () => {
        Logger.log("资源包加载完成！");
        hotUpdateUiComponent?.setProgress(1);
        hotUpdateUiComponent?.setLoadingText("加载完成！");
        hotUpdateUiComponent?.setLoadingDetailsText(`正在初始化游戏界面！`);

        // 构建音频资源映射（由 SOUND_LIST 派生，与预加载清单自动保持一致）
        const soundsMap: Config.SoundsMap = {
          Sounds: SOUND_LIST.map((s) => ({ name: s.name, url: s.url })),
        };
        // 映射音频资源
        SoundsManager.Instance.mapAudioClips(soundsMap);
        // 设置全局按钮音效
        SoundsManager.Instance.setGlobalButtonEffect("button_ui_click", [
          "_NoEffect",
        ]);

        // 初始化服务器配置
        let serverConfig = {
          env: "dev",
          version: "1.0.0",
          auth_server_url: "http://localhost",
          auth_server_port: 18000,
          gateway_server_url: "http://localhost",
          gateway_server_port: 18300,
          is_maintain: false,
        };

        // 判断是否本地开发
        if (GlobalData.Instance.isLocalDev) {
          // 本地开发：使用本地配置
          GlobalData.Instance.setServerConfig(serverConfig);
        } else {
          try {
            const data = await HttpApiServices.getServerConfigJson();
            if (data) {
              GlobalData.Instance.setServerConfig(data);
            } else {
              throw new Error("获取服务器配置失败！");
            }
          } catch (err) {
            Logger.error("获取服务器配置失败！", err);
            CommonDailogHandler.showDialogMessage(
              "获取服务器配置失败！\n请退出重试或联系管理员！",
              () => {
                // game.restart();
                Logger.log(`重启游戏`);
              },
            );
            // 默认配置
            GlobalData.Instance.setServerConfig(serverConfig);
          }
        }

        // 进入游戏场景
        this.enterGameScene();
      },
    );
  }

  /**
   * 进入游戏场景
   */
  public enterGameScene(): void {
    Logger.log("进入游戏场景");
    ComponentManager.Instance.destroyNodeByName("HotUpdateUI");
    Logger.log("热更新界面销毁成功！");

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

    Logger.log("挂载登陆界面成功！");
  }
}
