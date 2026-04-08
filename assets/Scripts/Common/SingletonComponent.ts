import { _decorator, Component, sys } from "cc";

/**
 * 单例组件
 */
// @ccclass("SingletonComponent")
export class SingletonComponent extends Component {
  private static _instance: any = null;

  static GetInstance<T>(): T {
    return this._instance;
  }

  static SetInstance<T>(instance: T) {
    this._instance = instance;
  }

  /**
   * 数据写入本地存储
   * @param key 数据的key
   * @param data 数据内容
   * @param callback 回调
   */
  public setDataToStorage(key: string, data: unknown, callback?: Function) {
    sys.isNative
      ? sys.localStorage.setItem(key, JSON.stringify(data))
      : localStorage.setItem(key, JSON.stringify(data));
    callback && callback();
  }

  /**
   * 根据key取出本地数据
   * @param key 数据的key
   * @returns
   */
  public getDataFromStorage(key: string) {
    if (key.trim()) {
      return sys.isNative
        ? sys.localStorage.getItem(key)
        : localStorage.getItem(key);
    } else {
      return null;
    }
  }

  /**
   * 根据key清除本地数据
   * @param key 数据的key
   */
  public deleteDataFromStorage(key: string) {
    if (key.trim()) {
      sys.localStorage.removeItem(key);
    }
  }

  /**
   * 清除所有缓存
   */
  public clearDataFromStorage() {
    sys.isNative ? sys.localStorage.clear() : localStorage.clear();
  }
}
