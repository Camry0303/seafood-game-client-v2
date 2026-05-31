/**
 * 配置相关
 */
export namespace Config {
  /**
   * 游戏音效配置
   */
  export type SoundsConfig = {
    bgmVolume: number;
    effectVolume: number;
    bgmEnabled: boolean;
    effectEnabled: boolean;
  };

  /**
   * 音效文件映射
   */
  export type SoundsMap = {
    [key: string]: {
      name: string;
      url: string;
    }[];
  };

  /**
   * 分数限制配置
   */
  export type ComboBoxOption = {
    id: number;
    label: string;
    value: any;
  };
}
