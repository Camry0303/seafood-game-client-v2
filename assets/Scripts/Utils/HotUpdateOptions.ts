import { Logger } from "./Logger";
import { HotUpdate } from "../Types/typing";

/**
 * 热更新参数类
 */
export class HotOptions {
  OnVersionInfo: HotUpdate.VersionCallback;
  OnNeedToUpdate: HotUpdate.HotCallback;
  OnNoNeedToUpdate: HotUpdate.HotCallback;
  OnUpdateFailed: HotUpdate.HotCallback;
  OnUpdateSucceed: HotUpdate.HotCallback;
  OnUpdateProgress: HotUpdate.HotCallback;

  check() {
    for (let key in this) {
      if (key !== "check") {
        if (!this[key]) {
          Logger.log(`参数HotOptions.${key}未设置！`);
          return false;
        }
      }
    }
    return true;
  }
}
