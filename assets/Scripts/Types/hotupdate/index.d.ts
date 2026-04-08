import { native } from "cc";

/**
 * 热更新相关
 */
export namespace HotUpdate {
  export type HotCallback = (event: native.EventAssetsManager) => void;
  export type VersionData = { local: string; server: string };
  export type VersionCallback = (param: VersionData) => void;
}
