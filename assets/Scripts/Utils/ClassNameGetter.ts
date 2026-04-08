import { Component } from "cc";

/**
 * 类名获取
 */
export default class ClassNameGetter {
  /**
   * 根据泛型获取类名
   * @param T
   * @returns
   */
  static getComponentClassName<T extends Component>(
    constructor: new (...args: any[]) => T
  ): string {
    return constructor.name;
  }
}
