/**
 * 泛型单例模式
 */
export default class Singleton {
  private static _instance: any = null;

  static GetInstance<T>(): T {
    /**如果获取到的对象是空，则new一个对象 */
    if (this._instance === null) {
      this._instance = new this();
    }
    return this._instance;
  }
}
