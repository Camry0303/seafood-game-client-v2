import { Gateway } from "../gateway";

/**
 * 通用
 */
export namespace Common {
  /**
   * 事件列表
   */
  export interface EventsMap {
    [key: string]: (data: Gateway.Returned.Common.Result<any>) => void;
  }

  /**
   * 已知定位位置
   */
  export type Location = {
    /**
     * 经度
     */
    longitude: number;
    /**
     * 纬度
     */
    latitude: number;
  };
}
