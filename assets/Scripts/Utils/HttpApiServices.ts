import moment from "moment";
import { Common, Gateway } from "../Types/typing";
import CryptoUtils from "./CryptoUtils";
import Constants from "../Common/Constants";
import { fly } from "../3rd/packages";
import { GlobalData } from "../Runtime/GlobalData";
import { RESPONE_RESULT } from "../Enums";

export default class HttpApiServices {
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
    let host = "";
    if (GlobalData.Instance.isLocalDev) {
      host = "http://localhost";
    } else {
      host = "http://61.164.174.115";
    }
    const port = "16888";
    const reponse = await fly.get(`${host}:${port}/captcha`);
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
    const port = "16888";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.SmsParams>(
        {
          phone_number,
          type,
          time: moment().unix(),
        },
        Constants.API_KEY,
      );
    const reponse = await fly.post(`${host}:${port}/sendSMS`, params);
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
    const port = "16888";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.PhoneRegisterParams>(
        rawParams,
        Constants.API_KEY,
      );

    const reponse = await fly.post(`${host}:${port}/registerByPhone`, params);
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
    const port = "16888";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.ResetPasswordParams>(
        rawParams,
        Constants.API_KEY,
      );

    const reponse = await fly.post(
      `${host}:${port}/resetPasswordByPhone`,
      params,
    );
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
    const port = "16888";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.PhoneLoginParams>(
        rawParams,
        Constants.API_KEY,
      );

    const reponse = await fly.post(`${host}:${port}/loginByPhone`, params);
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
    const port = "16888";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.WeChatAuthParams>(
        rawParams,
        Constants.API_KEY,
      );
    const response = await fly.post(`${host}:${port}/wechatAuthorize`, params);
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
    const port = "16888";
    const params =
      CryptoUtils.genSignedParams<Gateway.Requested.Authorization.BindPhoneParams>(
        rawParams,
        Constants.API_KEY,
      );

    const reponse = await fly.post(`${host}:${port}/bindPhone`, params);
    const data = reponse.data as Gateway.Returned.Common.Result<boolean>;
    return data;
  }
}
