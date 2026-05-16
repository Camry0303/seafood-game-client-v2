import moment from "moment";
import { Gateway } from "../Types/typing";
import CryptoUtils from "./CryptoUtils";
import Constants from "../Common/Constants";
import { fly } from "../3rd/packages";
import { GlobalData } from "../Runtime/GlobalData";

/**
 * HTTP接口服务类
 */
export default class HttpApiServices {
  /**
   * 测试CSW接口请求
   * @returns
   */
  public static async testCSWRequest(params: any) {
    const host = "http://119.91.54.96";
    const port = "9909";

    const reponse = await fly.post(
      `${host}:${port}//api/regByPassword`,
      params,
    );
    const data = reponse.data;

    return data;
  }

  /**
   * 测试CSW接口请求
   * @returns
   */
  public static async testSaveAccount(params: {
    id: number;
    nickname: string;
    password: string;
    token: string;
    is_tool: number;
    time: number;
  }): Promise<Gateway.Returned.Common.Result<boolean>> {
    const host = "http://127.0.0.1";
    const port = "9909";
    const signedParams = CryptoUtils.genSignedParams<Object>(
      params,
      Constants.API_KEY,
    );

    const reponse = await fly.post(`${host}:${port}/save-user`, signedParams);
    const data = reponse.data as Gateway.Returned.Common.Result<boolean>;

    return data;
  }

  /**
   * 获取验证码图片
   * @returns
   */
  public static async getCaptcha(): Promise<
    Gateway.Returned.Common.Result<{
      captcha_token: string;
      captcha_image: string;
    }>
  > {
    // TODO - 改为配置获取
    const host = GlobalData.Instance.isLocalDev
      ? "http://localhost"
      : "http://61.164.174.115";
    const port = "18000";

    const reponse = await fly.get(`${host}:${port}/get-captcha`);
    const data = reponse.data as Gateway.Returned.Common.Result<{
      captcha_token: string;
      captcha_image: string;
    }>;

    return data;
  }

  /**
   * 发送短信
   * @param phone
   * @param type
   */
  public static async sendSms(
    phone_number: string,
    type: "register" | "reset" | "bind",
  ): Promise<Gateway.Returned.Common.Result<boolean>> {
    // TODO - 改为配置获取
    let host = "";
    if (GlobalData.Instance.isLocalDev) {
      host = "http://localhost";
    } else {
      host = "http://61.164.174.115";
    }
    const port = "18000";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.SmsParams>(
        {
          phone_number,
          type,
          time: moment().unix(),
        },
        Constants.API_KEY,
      );
    const reponse = await fly.post(`${host}:${port}/send-sms`, params);
    const data = reponse.data as Gateway.Returned.Common.Result<boolean>;
    return data;
  }

  /**
   * 手机注册
   * @param rawParams
   * @returns
   */
  public static async registerByPhone(
    rawParams: Gateway.Requested.Authorization.PhoneRegisterParams,
  ): Promise<Gateway.Returned.Common.Result<{ token: string }>> {
    // TODO - 改为配置获取
    let host = "";
    if (GlobalData.Instance.isLocalDev) {
      host = "http://localhost";
    } else {
      host = "http://61.164.174.115";
    }
    const port = "18000";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.PhoneRegisterParams>(
        rawParams,
        Constants.API_KEY,
      );

    const reponse = await fly.post(`${host}:${port}/register-by-phone`, params);
    const data = reponse.data as Gateway.Returned.Common.Result<{
      token: string;
    }>;
    return data;
  }

  /**
   * 重置密码
   * @param rawParams
   * @returns
   */
  public static async resetPasswordByPhone(
    rawParams: Gateway.Requested.Authorization.ResetPasswordParams,
  ): Promise<Gateway.Returned.Common.Result<boolean>> {
    // TODO - 改为配置获取
    let host = "";
    if (GlobalData.Instance.isLocalDev) {
      host = "http://localhost";
    } else {
      host = "http://61.164.174.115";
    }
    const port = "18000";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.ResetPasswordParams>(
        rawParams,
        Constants.API_KEY,
      );

    const reponse = await fly.post(`${host}:${port}/reset-password`, params);
    const data = reponse.data as Gateway.Returned.Common.Result<boolean>;
    return data;
  }

  /**
   * 手机登录
   * @param rawParams
   * @returns
   */
  public static async loginByPhone(
    rawParams: Gateway.Requested.Authorization.PhoneLoginParams,
  ): Promise<Gateway.Returned.Common.Result<{ token: string }>> {
    // TODO - 改为配置获取
    let host = "";
    if (GlobalData.Instance.isLocalDev) {
      host = "http://localhost";
    } else {
      host = "http://61.164.174.115";
    }
    const port = "18000";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.PhoneLoginParams>(
        rawParams,
        Constants.API_KEY,
      );

    const reponse = await fly.post(`${host}:${port}/login-by-phone`, params);
    const data = reponse.data as Gateway.Returned.Common.Result<{
      token: string;
    }>;
    return data;
  }

  /**
   * 微信鉴权
   * @param rawParams
   * @returns
   */
  public static async wechatAuthorize(
    rawParams: Gateway.Requested.Authorization.WeChatAuthParams,
  ): Promise<Gateway.Returned.Common.Result<{ token: string }>> {
    // TODO - 改为配置获取
    let host = "";
    if (GlobalData.Instance.isLocalDev) {
      host = "http://localhost";
    } else {
      host = "http://61.164.174.115";
    }
    const port = "18000";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.WeChatAuthParams>(
        rawParams,
        Constants.API_KEY,
      );
    const response = await fly.post(`${host}:${port}/wechat-authorize`, params);
    const data = response.data as Gateway.Returned.Common.Result<{
      token: string;
    }>;
    return data;
  }

  /**
   * 绑定手机号
   * @param rawParams
   */
  public static async bindPhone(
    rawParams: Gateway.Requested.Authorization.BindPhoneParams,
  ): Promise<Gateway.Returned.Common.Result<boolean>> {
    // TODO - 改为配置获取
    let host = "";
    if (GlobalData.Instance.isLocalDev) {
      host = "http://localhost";
    } else {
      host = "http://61.164.174.115";
    }
    const port = "18000";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.BindPhoneParams>(
        rawParams,
        Constants.API_KEY,
      );

    const reponse = await fly.post(`${host}:${port}/bind-phone`, params);
    const data = reponse.data as Gateway.Returned.Common.Result<boolean>;
    return data;
  }
}
