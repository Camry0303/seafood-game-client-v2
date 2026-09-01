import { Asset, assetManager, native, sys } from "cc";
import { Logger } from "./Logger";
import { HotOptions } from "./HotUpdateOptions";

export default class HotUpdateTools {
  _assetsMgr: native.AssetsManager = null;
  _options: HotOptions = null;
  _state = HotUpdateTools.State.None;

  static State = {
    None: 0,
    Check: 1,
    Update: 2,
  };

  /**
   * 初始化热更新工具
   * @param manifest
   * @param opt
   * @returns
   */
  public initTools(manifest: Asset, opt: HotOptions) {
    if (!sys.isNative) {
      return;
    }
    if (!opt.check()) {
      return;
    }
    this._options = opt;

    if (this._assetsMgr) {
      return;
    }

    this.showSearchPath();
    let url = manifest.nativeUrl;

    // 废弃
    // if (loader.md5Pipe) {
    //   url = loader.md5Pipe.transformURL(url);
    // }

    let storagePath =
      (native.fileUtils ? native.fileUtils.getWritablePath() : "/") +
      "remote-asset";
    this._assetsMgr = new native.AssetsManager(
      url,
      storagePath,
      (versionA, versionB) => {
        // 比较版本
        Logger.log("客户端版本: " + versionA + ", 当前最新版本: " + versionB);
        this._options.OnVersionInfo({ local: versionA, server: versionB });
        let vA = versionA.split(".");
        let vB = versionB.split(".");
        for (let i = 0; i < vA.length; ++i) {
          let a = parseInt(vA[i]);
          let b = parseInt(vB[i] || "0");
          if (a !== b) {
            return a - b;
          }
        }
        if (vB.length > vA.length) {
          return -1;
        } else {
          return 0;
        }
      }
    );
    this._assetsMgr.setVerifyCallback((assetsFullPath, asset) => {
      let { compressed, md5, path, size } = asset;
      if (compressed) {
        return true;
      } else {
        return true;
      }
    });
    if (sys.os === sys.OS.ANDROID) {
      // 安卓手机设置 最大并发任务数量限制为2
      // this._assetsMgr.setMaxConcurrentTask(2);
    }

    let localManifest = this._assetsMgr.getLocalManifest();
    Logger.log("[HotUpdate] 热更新资源存放路径: " + storagePath);
    Logger.log("[HotUpdate] 本地manifest路径: " + url);
    Logger.log(
      "[HotUpdate] local packageUrl: " + localManifest.getPackageUrl()
    );
    Logger.log(
      "[HotUpdate] project.manifest remote url: " +
        localManifest.getManifestFileUrl()
    );
    Logger.log(
      "[HotUpdate] version.manifest remote url: " +
        localManifest.getVersionFileUrl()
    );
  }

  /**
   * 检查更新
   * @returns
   */
  public checkUpdate() {
    if (!this._assetsMgr) {
      Logger.error("请先初始化");
      return;
    }

    if (this._assetsMgr.getState() === native.AssetsManager.State.UNINITED) {
      Logger.error("未初始化");
      return;
    }
    if (!this._assetsMgr.getLocalManifest().isLoaded()) {
      Logger.error("加载本地 manifest 失败 ...");
      return;
    }
    this._assetsMgr.setEventCallback(this._hotUpdateCallBack.bind(this));
    this._state = HotUpdateTools.State.Check;
    // 下载version.manifest，进行版本比对
    this._assetsMgr.checkUpdate();
  }

  /**
   * 热更新
   * @returns
   */
  public hotUpdate() {
    if (!this._assetsMgr) {
      Logger.error("请先初始化");
      return;
    }
    this._assetsMgr.setEventCallback(this._hotUpdateCallBack.bind(this));
    this._state = HotUpdateTools.State.Update;
    this._assetsMgr.update();
  }

  /**
   * 热更新回调
   * @param event
   */
  private _hotUpdateCallBack(event: native.EventAssetsManager) {
    let code = event.getEventCode();
    Logger.log(`hotUpdate Code: ${code}`);
    const {
      ERROR_NO_LOCAL_MANIFEST,
      NEW_VERSION_FOUND,
      ALREADY_UP_TO_DATE,
      UPDATE_PROGRESSION,
      ASSET_UPDATED,
      UPDATE_FAILED,
      UPDATE_FINISHED,
      ERROR_DOWNLOAD_MANIFEST,
      ERROR_PARSE_MANIFEST,
      ERROR_UPDATING,
      ERROR_DECOMPRESS,
    } = native.EventAssetsManager;
    const codeMsg = {};
    codeMsg[ERROR_NO_LOCAL_MANIFEST.toString()] = "未找到manifest";
    codeMsg[ERROR_DOWNLOAD_MANIFEST.toString()] = "下载manifest失败";
    codeMsg[ERROR_PARSE_MANIFEST.toString()] = "解析manifest失败";
    codeMsg[ERROR_UPDATING.toString()] = "更新失败";
    codeMsg[ERROR_DECOMPRESS.toString()] = "解压失败";

    switch (code) {
      case native.EventAssetsManager.ALREADY_UP_TO_DATE:
        Logger.log("已经和远程版本一致，无须更新");
        this._options.OnNoNeedToUpdate && this._options.OnNoNeedToUpdate(event);
        break;
      case native.EventAssetsManager.NEW_VERSION_FOUND:
        Logger.log("发现新版本,请更新");
        this._options.OnNeedToUpdate && this._options.OnNeedToUpdate(event);
        break;
      case native.EventAssetsManager.UPDATE_PROGRESSION:
        Logger.log("更新中...");
        if (this._state === HotUpdateTools.State.Update) {
          this._options.OnUpdateProgress &&
            this._options.OnUpdateProgress(event);
        } else {
          // 检查状态下，不回调更新进度
        }
        break;
      case native.EventAssetsManager.UPDATE_FINISHED:
        Logger.log("更新成功");
        this._onUpdateFinished(event);
        break;
      case native.EventAssetsManager.ASSET_UPDATED:
        // 不予理会的消息事件
        break;
      default:
        Logger.log(`error code msg: ${codeMsg[code.toString()]}`);
        this._onUpdateFailed(event);
        break;
    }
  }

  /**
   * 热更新失败
   * @param event
   */
  private _onUpdateFailed(event: native.EventAssetsManager) {
    this._assetsMgr.setEventCallback(null);
    this._options.OnUpdateFailed && this._options.OnUpdateFailed(event);
  }

  /**
   * 热更新完成
   * @param event
   */
  private _onUpdateFinished(event: native.EventAssetsManager) {
    this._assetsMgr.setEventCallback(null);
    let searchPaths = native.fileUtils.getSearchPaths();
    let newPaths = this._assetsMgr.getLocalManifest().getSearchPaths();
    Logger.log("[HotUpdate] 搜索路径: " + JSON.stringify(newPaths));
    Array.prototype.unshift(searchPaths, newPaths);
    sys.localStorage.setItem(
      "HotUpdateSearchPaths",
      JSON.stringify(searchPaths)
    );
    native.fileUtils.setSearchPaths(searchPaths);
    this._options.OnUpdateSucceed && this._options.OnUpdateSucceed(event);
  }

  /**
   * 显示输出路径
   */
  private showSearchPath() {
    Logger.log("========================搜索路径========================");
    let searchPaths = native.fileUtils.getSearchPaths();
    for (let i = 0; i < searchPaths.length; i++) {
      Logger.log("[" + i + "]: " + searchPaths[i]);
    }
    Logger.log("======================================================");
  }
}
