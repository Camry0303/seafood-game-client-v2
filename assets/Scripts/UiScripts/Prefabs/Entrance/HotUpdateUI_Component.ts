import {
  _decorator,
  Asset,
  game,
  Label,
  native,
  Node,
  ProgressBar,
  sys,
  Tween,
  tween,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import HotUpdateTools from "../../../Utils/HotUpdateTools";
import { HotOptions } from "../../../Utils/HotUpdateOptions";
import { HotUpdate } from "../../../Types/typing";
import { Game } from "../../Game";
import { GlobalData } from "../../../Runtime/GlobalData";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import Constants from "../../../Common/Constants";
import { CircleLoadingUI_Component } from "../Common/CircleLoadingUI_Component";
const { ccclass, menu } = _decorator;

@ccclass("HotUpdateUI_Component")
@menu("Hidden/HotUpdateUI_Component")
export class HotUpdateUI_Component extends ComponentController {
  /**
   * 版本号节点
   */
  private _versionNode: Node = null;

  /**
   * 进度条容器节点
   */
  private _progressContainerNode: Node = null;

  /**
   * 进度条节点
   */
  private _progressBarNode: Node = null;

  /**
   * 加载文本节点
   */
  private _loadingTextNode: Node = null;

  /**
   * 加载详情文本节点
   */
  private _loadingDetailsTextNode: Node = null;

  /**
   * 圆形加载节点
   */
  private _circleLoadingUINode: Node = null;

  private _circleLoadingNode: Node = null;

  private _rotateTween: Tween = null;

  /**
   * 热更新工具实例
   */
  private _hotUpdateTools: HotUpdateTools = null;

  /**
   * 设置Manifest文件
   */
  private _manifest: Asset = null;

  start() {
    // 是否显示热更新进度
    this._progressContainerNode.active = Constants.SHOW_HOTUPDATE_PROCESS;

    if (!Constants.SHOW_HOTUPDATE_PROCESS) {
      this._circleLoadingUINode.active = true;
      this.startRotateAnimation();
    } else {
      this._circleLoadingUINode.active = false;
    }

    // 初始化热更新工具
    this._initHotUpdateTools();
    console.log(`热更新工具初始化完成！`);

    // 热更新界面运行，检查是否需要更新
    if (this._hotUpdateTools) {
      if (sys.isNative) {
        // 原生平台需要热更新
        if (this._manifest) {
          this.setLoadingText("正在检查更新...");
          this.setLoadingDetailsText("");
          this._hotUpdateTools.checkUpdate();
        } else {
          this.setLoadingText("Manifest文件不存在！");
          this.setLoadingDetailsText("");
        }
      } else {
        console.log("web 平台不需要热更新,直接进入游戏！");
        // 不需要热更新进入游戏
        Game.Instance.startGame(this);
      }
    } else {
      this.setLoadingText("热更新工具未初始化！");
      this.setLoadingDetailsText("");
    }
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._versionNode = this.getNode("Version");
    this.setVersion("本地版本号:1.0.0, 服务器版本号:1.0.0");

    this._progressContainerNode = this.getNode("ProgressContainer");

    this._progressBarNode = this.getNode("ProgressContainer/ProgressBar");
    this.setProgress(0);

    this._loadingTextNode = this.getNode("ProgressContainer/LoadingText");
    this.setLoadingText("");

    this._loadingDetailsTextNode = this.getNode(
      "ProgressContainer/LoadingDetailText",
    );
    this.setLoadingDetailsText("");

    this._circleLoadingUINode = this.getNode("CircleLoading");
    this._circleLoadingNode = this.getNode("CircleLoading/Loading");
  }

  /**
   * 初始化热更新工具
   */
  private _initHotUpdateTools() {
    // 热更新工具配置
    const hotUpdateOptions: HotOptions = new HotOptions();

    // 版本号信息回调
    hotUpdateOptions.OnVersionInfo = (data: HotUpdate.VersionData) => {
      let { local, server } = data;
      this.setVersion(`本地版本号:${local}, 服务器版本号:${server}`);
    };

    // 更新进度回调
    hotUpdateOptions.OnUpdateProgress = (event: native.EventAssetsManager) => {
      const downloadedMB = (event.getDownloadedBytes() / 1000000).toFixed(2);
      const totalMB = (event.getTotalBytes() / 1000000).toFixed(2);

      const downloadedFiles = event.getDownloadedFiles();
      const totalFiles = event.getTotalFiles();

      const msg = event.getMessage();

      const fileCountsText = `(${downloadedFiles}/${totalFiles})`;
      const fileSizesText = `[${downloadedMB}MB /${totalMB}MB]`;

      const progress = event.getPercentByFile();

      this.setProgress(progress);
      this.setLoadingText(
        `正在更新中,请耐心等待(${(progress * 100).toFixed(2)}%)...`,
      );
      this.setLoadingDetailsText(`正在下载:${fileCountsText} ${fileSizesText}`);
    };

    // 需要更新回调
    hotUpdateOptions.OnNeedToUpdate = (event: native.EventAssetsManager) => {
      const totalMB = (event.getTotalBytes() / 1000000).toFixed(2);
      const totalFiles = event.getTotalFiles();
      // 自动进入更新
      this._hotUpdateTools.hotUpdate();
      // DialogMgr.showTipsWithOkBtn(
      //   `检测到新版本,一共${fileCount}个文件:${fileSize}Kb\n点击确定开始更新`,
      //   () => {
      //     HotUpdateUtils.hotUpdate();
      //   }
      // );
    };

    /**
     * 不需要更新回调
     */
    hotUpdateOptions.OnNoNeedToUpdate = () => {
      // 没有新版本，不需要热更直接进入游戏
      Game.Instance.startGame(this);
    };

    /**
     * 热更新失败回调
     * @param event
     */
    hotUpdateOptions.OnUpdateFailed = (event: native.EventAssetsManager) => {
      const code: number = event.getEventCode();
      const detail = (event.getMessage && event.getMessage()) || "";
      console.error(`[HotUpdate] 更新失败 code=${code}, msg=${detail}`);
      const msg = `更新失败:${code}[${detail}]`;
      this.setLoadingText(msg);
      this.setLoadingDetailsText(`游戏更新失败，请点击确定重试！`);

      CommonDailogHandler.showDialogMsgCallback(
        {
          tips: "",
          message: "更新失败！请点击确定重试！",
          confirmText: "确定",
        },
        () => {
          this._hotUpdateTools.checkUpdate();
        },
      );
    };

    hotUpdateOptions.OnUpdateSucceed = () => {
      this.setLoadingText("更新成功！");
      this.setLoadingDetailsText(``);
      console.log(`更新成功重启游戏！`);
      game.restart();
      // DialogMgr.showTipsWithOkBtn("更新成功,点击确定重启游戏", () => {
      //   cc.audioEngine.stopAll();
      //   cc.game.restart();
      // });
    };

    this._hotUpdateTools = new HotUpdateTools();

    // 初始化热更新工具
    this._hotUpdateTools.initTools(this._manifest, hotUpdateOptions);
  }

  /**
   * 设置版本信息
   * @param version
   */
  public setVersion(version: string) {
    GlobalData.Instance.setVersionString(version);
    const versionLabel = this._versionNode.getComponent(Label);
    if (versionLabel) {
      versionLabel.string = version;
    } else {
      console.error(`[HotUpdateUI_Component] versionLabel is null!`);
    }
  }

  /**
   * 设置进度
   * @param progress
   */
  public setProgress(progress: number) {
    const progressBarComp = this._progressBarNode.getComponent(ProgressBar);
    if (progressBarComp) {
      progressBarComp.progress = progress;
    } else {
      console.error(`[HotUpdateUI_Component] progressBarComp is null!`);
    }
  }

  /**
   * 设置加载文本
   * @param text
   */
  public setLoadingText(text: string) {
    const loadingTextLabel = this._loadingTextNode.getComponent(Label);
    if (loadingTextLabel) {
      loadingTextLabel.string = text;
    } else {
      console.error(`[HotUpdateUI_Component] loadingTextLabel is null!`);
    }
  }

  /**
   * 设置加载详情文本
   * @param text
   */
  public setLoadingDetailsText(text: string) {
    const loadingDetailsTextLabel =
      this._loadingDetailsTextNode.getComponent(Label);
    if (loadingDetailsTextLabel) {
      loadingDetailsTextLabel.string = text;
    } else {
      console.error(`[HotUpdateUI_Component] loadingDetailsTextLabel is null!`);
    }
  }

  /**
   * 设置Manifest文件
   * @param manifest
   */
  public setManifest(manifest: Asset) {
    this._manifest = manifest;
  }

  /**
   * 开始旋转动画
   */
  public startRotateAnimation() {
    // 如果已有动画，先停止
    if (this._rotateTween) {
      this._rotateTween.stop();
    }

    // 创建并启动旋转动画
    this._rotateTween = tween(this._circleLoadingNode)
      .by(1, { angle: -360 }) // 1秒内旋转360度
      .union() // 合并动画，使旋转更流畅
      .repeatForever() // 无限循环
      .start();
  }
}
