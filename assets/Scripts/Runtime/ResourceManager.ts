import { Logger } from "../Utils/Logger";
import {
  __private,
  _decorator,
  Asset,
  AssetManager,
  assetManager,
  ImageAsset,
  SpriteFrame,
  Texture2D,
} from "cc";
import { ResMgr } from "../Types/typing";
import { SingletonComponent } from "../Common/SingletonComponent";
const { ccclass, property } = _decorator;

/**
 * 资源管理类
 */
// @ccclass("ResourceManager")
export class ResourceManager extends SingletonComponent {
  /**
   * 是否输出详细加载日志（成功级）。默认关闭以减少日志噪音；
   * 排查加载问题时可临时置为 true。错误日志不受此开关影响，始终输出。
   */
  public static verboseLog: boolean = false;

  /** 详细日志输出（受 verboseLog 开关控制） */
  private static log(...args: unknown[]): void {
    if (ResourceManager.verboseLog) {
      Logger.log(...args);
    }
  }

  private _assetsBundle: { [key: string]: AssetManager.Bundle } = {};

  private _total: number = 0;

  private _loaded: number = 0;

  private _totalAb: number = 0;

  private _loadedAb: number = 0;

  private _progressFunc: Function = null;

  private _completeFunc: Function = null;

  // 单例
  static get Instance() {
    return super.GetInstance<ResourceManager>();
  }

  protected onLoad(): void {
    // 单例模式代码
    if (ResourceManager.GetInstance() === null) {
      ResourceManager.SetInstance(this);
    } else {
      this.destroy();
    }
  }

  /**
   * 加载AssetBundle
   * @param abName
   * @param completeFunc
   */
  private loadAssetsBundle(abName: string, completeFunc: Function): void {
    assetManager.loadBundle(abName, (err, bundle) => {
      if (err) {
        Logger.error(
          `[ResourceManager] loadAssetsBundle <${abName}> failed: ${err}`
        );
        this._assetsBundle[abName] = null;
        return;
      } else {
        ResourceManager.log(
          `[ResourceManager] loadAssetsBundle <${abName}> success!`
        );
        this._assetsBundle[abName] = bundle;
      }
      if (completeFunc) {
        completeFunc(bundle);
      }
    });
  }

  /**
   * 加载AssetBundle中的Asset
   * @param resPkg
   */
  public loadAssetsInAssetBundle<T extends Asset>(
    resPkg: ResMgr.ResourcePackage<T>
  ): void {
    for (let abName in resPkg) {
      const pkgs = resPkg[abName];
      for (let pkg of pkgs) {
        let urlSet = pkg.urls;
        let typeClass = pkg.assetType;
        for (let url of urlSet) {
          this.loadAsset(this._assetsBundle[abName], url, typeClass);
        }
      }
    }
  }

  /**
   * 加载Asset
   * @param assetsBundle
   * @param url
   * @param typeClass
   */
  public loadAsset<T extends Asset>(
    assetsBundle: AssetManager.Bundle,
    url: string,
    typeClass: __private.__types_globals__Constructor<T>
  ): void {
    assetsBundle.load(url, typeClass, (error, asset) => {
      this._loaded++;
      if (error) {
        Logger.error(`[ResourceManager] loadAsset <${url}> failed: ${error}`);
      } else {
        const clazz = asset.constructor;
        ResourceManager.log(
          `[ResourceManager] loadAsset <${clazz.name}>-<${url}> success!`
        );

        if (this._progressFunc) {
          this._progressFunc(
            this._loaded,
            this._total,
            `资源(${clazz.name})-(${url})加载中...`
          );
        }
      }

      if (this._loaded >= this._total) {
        if (this._completeFunc) {
          this._completeFunc();
        }
      }
    });
  }

  /**
   * 预加载资源包
   * @param resPkg
   * @param progressFunc
   * @param completeFunc
   */
  public preloadResourcePackages(
    resPkg: ResMgr.ResourcePackage<Asset>,
    progressFunc: Function,
    completeFunc: Function
  ): void {
    // 初始化预加载状态
    this._total = 0;
    this._loaded = 0;
    this._totalAb = 0;
    this._loadedAb = 0;
    this._progressFunc = progressFunc;
    this._completeFunc = completeFunc;
    // 遍历资源包
    for (let abName in resPkg) {
      // 计算总资源数
      for (let index = 0; index < resPkg[abName].length; index++) {
        const pkgElement = resPkg[abName][index];
        this._total += pkgElement.urls.length;
      }
      // 计算总资源包数
      this._totalAb++;
    }

    // 加载资源包
    for (let abName in resPkg) {
      this.loadAssetsBundle(abName, (assetsBundle: AssetManager.Bundle) => {
        this._loadedAb++;
        if (this._loadedAb === this._totalAb) {
          this.loadAssetsInAssetBundle(resPkg);
        }
      });
    }
  }

  /**
   * 获取资源
   * @param abName
   * @param url
   * @returns
   */
  public getAsset<T extends Asset>(abName: string, url: string): T {
    const bundle = assetManager.getBundle(abName);
    if (bundle) {
      return bundle.get(url) as T;
    } else {
      Logger.error(
        `[ResourceManager] getAsset <${url}> failed: bundle <${abName}> is null`
      );
    }
    return null;
  }

  /**
   * 获取SpriteFrame
   * @param abName
   * @param url
   * @returns
   */
  public getSpriteFrame(abName: string, url: string): SpriteFrame {
    const imageAsset = this.getAsset<ImageAsset>(abName, url);
    if (!imageAsset) {
      return null;
    }
    const texture = new Texture2D();
    texture.image = imageAsset;
    const spriteFrame = new SpriteFrame();
    spriteFrame.texture = texture;
    return spriteFrame;
  }

  /**
   * 加载远程图片为 SpriteFrame
   * @param url 远程图片地址（http/https）
   * @returns Promise<SpriteFrame>
   */
  public loadRemoteSprite(url: string): Promise<SpriteFrame> {
    return new Promise<SpriteFrame>((resolve, reject) => {
      assetManager.loadRemote<ImageAsset>(url, { ext: ".png" }, (err, imageAsset) => {
        if (err || !imageAsset) {
          reject(err || new Error(`loadRemote <${url}> failed`));
          return;
        }
        const texture = new Texture2D();
        texture.image = imageAsset;
        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = texture;
        resolve(spriteFrame);
      });
    });
  }
}
