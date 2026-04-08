import { Overflow } from "cc";

/**
 * UI相关
 */
export namespace UI {
  /**输入属性 */
  export type InputProperty = {
    /**
     * 提示内容
     */
    tips: string;
    /**
     * 是否允许空值
     */
    isRequired: boolean;
    /**
     * 最大长度
     */
    maxLength: number;
    /**
     * 占位显示
     */
    placeholder: string;
    /**
     * 高度
     */
    height?: number;
    /**
     * 默认值
     */
    defaultValue?: string;
    /**
     * 是否显示字数限制
     */
    showLimitInfo?: boolean;
    /**
     * 溢出处理
     */
    overFlow?: Overflow;
  };

  /**回调信息框属性 */
  export type MsgCallbackProperty = {
    message: string;
    tips: string;
    confirmText?: string;
  };
}
