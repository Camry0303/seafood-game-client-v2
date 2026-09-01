import { GlobalData } from "../Runtime/GlobalData";

/**
 * 统一日志工具
 * 所有日志输出受 GlobalData.Instance.enableConsoleLog 开关控制，
 * 生产环境设为 false 即可关闭全部日志，避免刷屏与信息泄露。
 */
export class Logger {
  /** 是否实际输出（读取全局开关） */
  private static get enabled(): boolean {
    return GlobalData.Instance?.enableConsoleLog ?? false;
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
