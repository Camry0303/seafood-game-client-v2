/**
 * 发送短信验证码请求负载
 */
export type SmsParams = {
  /**
   * 手机号
   */
  phone_number: string;
  /**
   * 使用类型 register reset bind
   */
  type: "register" | "reset" | "bind";
  /**
   * 时间
   */
  time: number;
  /**
   * 签名
   */
  sign: string;
};

/**
 * 手机注册请求负载
 */
export type PhoneRegisterParams = {
  /**
   * 手机号
   */
  phone_number: string;
  /**
   * 验证码
   */
  captcha: string;
  /**
   * 验证码token
   */
  captcha_token: string;
  /**
   * 短信验证码
   */
  code: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 时间
   */
  time: number;
  /**
   * 签名
   */
  sign: string;
};

/**
 * 重置密码请求负载
 */
export type ResetPasswordParams = {
  /**
   * 手机号
   */
  phone_number: string;
  /**
   * 验证码
   */
  captcha: string;
  /**
   * 验证码token
   */
  captcha_token: string;
  /**
   * 短信验证码
   */
  code: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 时间
   */
  time: number;
  /**
   * 签名
   */
  sign: string;
};

/**
 * 手机登录请求负载
 */
export type PhoneLoginParams = {
  /**
   * 手机号
   */
  phone_number: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 验证码
   */
  captcha: string;
  /**
   * 验证码token
   */
  captcha_token: string;
  /**
   * 时间
   */
  time: number;
  /**
   * 签名
   */
  sign: string;
};

/**
 * 微信授权请求负载
 */
export type WeChatAuthParams = {
  /**
   * OpenId
   */
  openId: string;
  /**
   * 微信昵称
   */
  nickname: string;
  /**
   * 头像地址
   */
  avatar: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 时间
   */
  time: number;
  /**
   * 签名
   */
  sign: string;
};

/**
 * 绑定手机请求负载
 */
export type BindPhoneParams = {
  /**
   * 玩家id
   */
  id: number;
  /**
   * 手机号
   */
  phone_number: string;
  /**
   * 验证码
   */
  code: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 时间
   */
  time: number;
  /**
   * 签名
   */
  sign: string;
};
