import { native, sys } from "cc";
import { Logger } from "./Logger";
import { ComponentManager } from "../Runtime/ComponentManager";
import CryptoUtils from "./CryptoUtils";
import moment from "moment";
import { Gateway } from "../Types/typing";
import HttpApiServices from "./HttpApiServices";
import { RESPONE_RESULT } from "../Enums";
import SocketManager from "../Network/SocketIo/SocketManager";
import md5 from "md5";
import { fly } from "../3rd/packages";
import NativeAPI from "./NativeAPI";
import CommonDailogHandler from "./CommonDailogHandler";
import { WAITING_TYPE } from "../UiScripts/Prefabs/Common/CircleLoadingUI_Component";

/**
 * 微信授权返回数据
 */
type WeChatAuthRes = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
};

/**
 * 微信用户返回信息
 */
type WechatUserInfo = {
  openid?: string;
  nickname?: string;
  sex?: number;
  province?: string;
  city?: string;
  country?: string;
  headimgurl?: string;
  privilege?: string[];
  unionid?: string;
};

/**
 * 微信登录服务
 */
export default class WeChatLoginService {
  public static isAndroid = sys.isNative && sys.os === sys.OS.ANDROID;
  public static isIOS = sys.isNative && sys.os === sys.OS.IOS;
  private static appId = "wx8fec0cd047c3178b";
  private static appSecret = "ee322f7379d3d09b6e7c34c0b5b26e87";

  /**
   * 微信登录
   */
  public static Login() {
    // 显示等待动画
    CommonDailogHandler.showCircleLoading(WAITING_TYPE.WECHAT_AUTH);

    if (WeChatLoginService.isAndroid) {
      Logger.log("Android--点击了微信登录");
      NativeAPI.WeChatLoginAndroid();
    } else if (WeChatLoginService.isIOS) {
      Logger.log("IOS--点击了微信登录");
      NativeAPI.WeChatLoginIOS();
    } else {
      Logger.log(`${sys.os}--点击了微信登录`);
      this.getWeChatUserTest();
    }
  }

  /**
   * 获取微信用户信息并登陆
   * @param accessCode
   */
  public static async doWechatLogin(accessCode: string) {
    try {
      const [accessToken, openid] = await this.getAccessToken(accessCode);
      if (!(accessToken && openid)) {
        throw new Error("获取微信accessToken和openid失败！");
      }
      // 获取用户信息
      const userInfo: WechatUserInfo = await this.getWeChatUser(
        accessToken,
        openid,
      );
      if (!userInfo) {
        throw new Error("获取微信用户信息失败！");
      }
      // 处理授权登陆
      this.wechatAuthorize(userInfo);
    } catch (error) {
      CommonDailogHandler.showBubbleMessage(
        `微信登录失败！\n\r${(error as Error).message}`,
      );
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.WECHAT_AUTH);
    }
  }

  /**
   * 获取微信accessToken
   * @param code
   */
  private static async getAccessToken(code: string) {
    // 获取accessToken Url
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;

    const response = await fly.get(url);
    // 统一处理 fly 返回字符串/对象两种情形，避免 JSON.parse 崩溃或 errcode 判断失效
    const data: WeChatAuthRes = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    // 判断返回结果
    if (data.errcode) {
      CommonDailogHandler.showDialogMessage(
        `微信登录失败！\n\r<get access token>\n\r${JSON.stringify(data)}`,
      );
      return [null, null];
    }
    if (!data.access_token) {
      CommonDailogHandler.showDialogMessage(JSON.stringify(data));
      throw new Error(JSON.stringify(data));
    }
    const openid = data.openid;
    const refresh_token = data.refresh_token;
    let access_token = data.access_token;

    // 如果超时进行重新刷新accessToken
    if (data.expires_in >= 7200) {
      // 刷新accessToken Url
      const refreshUrl = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${this.appId}&grant_type=refresh_token&refresh_token=${refresh_token}`;
      const refreshResponse = await fly.get(refreshUrl);
      // 统一解析刷新响应
      const refreshData: WeChatAuthRes = typeof refreshResponse.data === 'string' ? JSON.parse(refreshResponse.data) : refreshResponse.data;
      // 判断返回结果
      if (refreshData.errcode) {
        CommonDailogHandler.showDialogMessage(
          `微信登录失败！\n\r<reflush access token>\n\r${JSON.stringify(refreshData)}`,
        );
        return [null, null];
      }
      access_token = refreshData.access_token;
    }

    return [access_token, openid];
  }

  /**
   * 获取授权用户信息
   * @param access_token
   * @param openid
   */
  private static async getWeChatUser(access_token: string, openid: string) {
    // 获取授权用户信息url
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`;

    const response = await fly.get(url);

    // 统一处理 fly 返回字符串/对象两种情形，避免 JSON.parse 崩溃或 errcode 判断失效
    const res = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    if (res.errcode) {
      CommonDailogHandler.showDialogMessage(
        `微信登录失败！\n\r<get user info>\n\r${JSON.stringify(res)}`,
      );
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.WECHAT_AUTH);
      return;
    }

    // 返回微信授权用户信息
    return res as WechatUserInfo;
  }

  /**
   * 微信授权登录
   * @param data
   */
  private static async wechatAuthorize(data: WechatUserInfo) {
    // 计算密码
    const password = CryptoUtils.desEncryptPassword(
      md5(data.openid).toString().slice(0, 8).toUpperCase(),
    );
    // 设置请求参数
    const params: Gateway.Requested.Authorization.WeChatAuthParams = {
      openId: data.openid,
      nickname: data.nickname,
      avatar: data.headimgurl,
      password,
      time: moment().unix(),
      sign: "",
    };

    // 发送登录请求
    const authResponse = await HttpApiServices.wechatAuthorize(params);

    if (authResponse.code === RESPONE_RESULT.SUCCESS) {
      // 注册成功，拿到token，保存到本地，并且登录网关服务器建立长连接
      ComponentManager.Instance.setDataToStorage(
        "token",
        authResponse.data.token,
      );
      // 连接网关服务器，进行登录
      SocketManager.Instance.connect();
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.WECHAT_AUTH);
    } else {
      CommonDailogHandler.showBubbleMessage(`登录失败！${authResponse.msg}`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.WECHAT_AUTH);
    }
  }

  /** localStorage 中缓存测试微信用户的键名 */
  private static readonly WECHAT_TEST_USER_KEY = "wechat_test_user";

  /**
   * 测试微信授权登录
   * 优先从 localStorage 读取已缓存的测试用户，没有则使用内置测试数据并写回 localStorage。
   */
  private static async getWeChatUserTest() {
    let data: WechatUserInfo = null;

    const cached = sys.localStorage.getItem(this.WECHAT_TEST_USER_KEY);
    if (cached) {
      try {
        data = JSON.parse(cached) as WechatUserInfo;
      } catch (e) {
        Logger.warn(`解析缓存的测试微信用户失败: ${e}`);
      }
    }

    if (!data) {
      data = {
        openid: "oMgfa6qWYJjJb5JRwBRU5ferYOkX",
        nickname: "踏雪山巅", //昵称
        headimgurl:
          "https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83erEia7Tic6IL9wDRqtefBNt7qZ0s69WwV4BM3IzicxKlArCbYUUIT3L2VtMlWFjbwghlOgg47nd7dicYw/132", //头像
      };
      sys.localStorage.setItem(
        this.WECHAT_TEST_USER_KEY,
        JSON.stringify(data),
      );
    }

    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.WECHAT_AUTH);

    // 处理授权登录
    this.wechatAuthorize(data);
  }
}
