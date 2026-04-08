import { __private, Asset } from "cc";

/**
 * 资源管理
 */
export namespace ResMgr {
  /**
   * 资源包
   */
  export type ResourcePackage<T extends Asset> = {
    [key: string]: {
      assetType: __private.__types_globals__Constructor<T>;
      urls: string[];
    }[];
  };
}
