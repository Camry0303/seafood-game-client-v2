/**
 * 统一日志工具
 * 所有日志输出受 GlobalData.Instance.enableConsoleLog 开关控制，
 * 生产环境设为 false 即可关闭全部日志，避免刷屏与信息泄露。
 *
 * 注意：此处刻意不直接 import GlobalData，改用 globalThis 桥接开关，
 * 以避免 Logger -> GlobalData -> ... -> ComponentController -> Logger 的循环依赖
 * （该循环会导致 Cocos SystemJS 在某些模块加载顺序下出现
 * "Class extends value undefined" 报错）。
 */
const GLOBAL_FLAG = "__ENABLE_CONSOLE_LOG__";

export class Logger {
  /** 是否实际输出（读取全局开关，默认 false） */
  private static get enabled(): boolean {
    return (globalThis as unknown as Record<string, boolean>)[GLOBAL_FLAG] === true;
  }

  /** 由 GlobalData 在初始化/切换开关时调用，同步日志总开关 */
  public static setEnabled(value: boolean): void {
    (globalThis as unknown as Record<string, boolean>)[GLOBAL_FLAG] = value;
  }

  public static log(...args: unknown[]): void {
    if (Logger.enabled) {
      console.log(...args);
    }
  }

  public static info(...args: unknown[]): void {
    if (Logger.enabled) {
      console.info(...args);
    }
  }

  public static warn(...args: unknown[]): void {
    if (Logger.enabled) {
      console.warn(...args);
    }
  }

  public static error(...args: unknown[]): void {
    if (Logger.enabled) {
      console.error(...args);
    }
  }

  public static debug(...args: unknown[]): void {
    if (Logger.enabled) {
      console.debug(...args);
    }
  }
}
