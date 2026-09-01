import { native, game } from "cc";
import { Logger } from "./Logger";
import WeChatLoginService from "./WeChatLoginService";
import {
  ANDROID_LOCATION_STATUS,
  BATTERY_STATUS,
  IOS_LOCATION_STATUS,
} from "../Enums";
import { GlobalData } from "../Runtime/GlobalData";
import CommonDailogHandler from "./CommonDailogHandler";
import { WAITING_TYPE } from "../UiScripts/Prefabs/Common/CircleLoadingUI_Component";

/**
 * 原生相关工具类
 */
export default class NativeAPI {
  /**
   * 获取Android签名域名
   */
  public static getSignCodeAndroid() {
    const signDomain: string = native.reflection.callStaticMethod(
      "com/cocos/game/AppActivity",
      "getSignDomain",
      "()Ljava/lang/String;",
    );
    Logger.log("getSignCodeAndroid--->", signDomain);
    return signDomain;
  }

  /**
   * 获取IOS签名域名
   */
  public static getSignCodeIOS() {
    // @ts-ignore
    const signDomain = native.reflection.callStaticMethod(
      "AppDelegate",
      "getSignDomain",
    );
    Logger.log(`getSignCodeIOS--->`, signDomain);
    return signDomain;
  }

  /**
   * Android调用Java微信SDK，拉起微信
   */
  public static WeChatLoginAndroid() {
    //调用java代码进行微信登录
    native.reflection.callStaticMethod(
      "com/cocos/game/AppActivity",
      "wxLogin",
      "()V",
    );
  }

  /**
   * IOS系统调用OC进行微信登录
   */
  public static WeChatLoginIOS() {
    //点击微信登陆调用OC AppDelegate类的 wechatLogin.
    // @ts-ignore
    native.reflection.callStaticMethod("AppDelegate", "wechatLogin");
  }

  /**
   * 接受原生返回的微信登录AccessCode并处理登陆
   * @param accessCode
   */
  public static receiveAccessCode(accessCode: string) {
    WeChatLoginService.doWechatLogin(accessCode);
  }

  /**
   * 原生通知微信授权失败原因
   * @param msg
   */
  public static notifyWxAuthFailed(msg: string) {
    CommonDailogHandler.showDialogMessage(msg);
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.WECHAT_AUTH);
  }

  /**
   * 获取Android当前电量
   * @returns
   */
  public static getBatteryInfoAndroid() {
    const batteryInfoString: string = native.reflection.callStaticMethod(
      "com/cocos/game/AppActivity",
      "getBatteryInfo",
      "()Ljava/lang/String;",
    );
    const batteryInfoArray = batteryInfoString.split(",");
    //电池信息
    const batteryInfo: {
      batteryPct: number;
      batteryStatus: BATTERY_STATUS;
    } = {
      batteryPct: Number(batteryInfoArray[0]) * 100,
      batteryStatus: Number(batteryInfoArray[1]),
    };
    Logger.log("getBatteryInfoAndroid--->", JSON.stringify(batteryInfo));
    return batteryInfo;
  }

  /**
   * 获取IOS当前电池信息
   * @returns
   */
  public static getBatteryInfoIOS() {
    // @ts-ignore
    const batteryInfoString = native.reflection.callStaticMethod(
      "AppDelegate",
      "getBatteryInfo",
    );
    const batteryInfoArray = batteryInfoString.split(",");
    //电池信息
    const batteryInfo: {
      batteryPct: number;
      batteryStatus: BATTERY_STATUS;
    } = {
      batteryPct: Number(batteryInfoArray[0]) * 100,
      batteryStatus: Number(batteryInfoArray[1]),
    };
    Logger.log(`getBatteryInfoIOS--->`, JSON.stringify(batteryInfo));
    return batteryInfo;
  }

  /**
   * Android开始监听电池状态变化
   */
  public static startBatteryMonitoringAndroid() {
    native.reflection.callStaticMethod(
      "com/cocos/game/AppActivity",
      "startBatteryMonitoring",
      "()V",
    );
  }

  /**
   * IOS开始监听电池状态变化
   */
  public static startBatteryMonitoringIOS() {
    // @ts-ignore
    native.reflection.callStaticMethod("AppDelegate", "startBatteryMonitoring");
  }

  /**
   * Android停止监听电池状态变化
   */
  public static stopBatteryMonitoringAndroid() {
    native.reflection.callStaticMethod(
      "com/cocos/game/AppActivity",
      "stopBatteryMonitoring",
      "()V",
    );
  }

  /**
   * IOS停止监听电池状态变化
   */
  public static stopBatteryMonitoringIOS() {
    // @ts-ignore
    native.reflection.callStaticMethod("AppDelegate", "stopBatteryMonitoring");
  }

  /**
   * 原生接收电池信息信息并处理
   * TODO
   * @param msg
   */
  public static receiveBatteryInfo(batteryPct: string, batteryStatus: string) {
    //电池信息
    const batteryInfo: {
      batteryPct: number;
      batteryStatus: BATTERY_STATUS;
    } = {
      batteryPct: Number(batteryPct) * 100,
      batteryStatus: Number(batteryStatus),
    };
    CommonDailogHandler.showDialogMessage(
      `batteryPct:${batteryInfo.batteryPct},batteryStatus:${batteryInfo.batteryStatus}`,
    );
    Logger.log("receiveBatteryInfo batteryInfo--->", batteryInfo);
  }

  /**
   * Android请求位置权限
   */
  public static requestLocationPermissionAndroid() {
    native.reflection.callStaticMethod(
      "com/cocos/game/AppActivity",
      "requestLocationPermission",
      "()V",
    );
    game.pause(); // 暂停游戏
  }

  /**
   * IOS请求位置权限
   */
  public static requestLocationPermissionIOS() {
    // @ts-ignore
    native.reflection.callStaticMethod(
      "AppDelegate",
      "requestLocationPermission",
    );
  }

  /**
   * 接收请求定位授权结果
   * @param result
   */
  public static onLocationPermissionIsGranted(result: string) {
    Logger.log("onLocationPermissionIsGranted--->", result);
    const resultObj = JSON.parse(result) as {
      isGranted: boolean;
      system: "IOS" | "ANDROID";
    };
    if (resultObj.system == "ANDROID") {
      game.resume(); // 恢复游戏
    }
    // 判断授权结果，做相应处理
    if (resultObj.isGranted) {
      // 处理授权成功！获取最后位置！
      switch (resultObj.system) {
        case "IOS":
          NativeAPI.getLastLocationIOS();
          break;
        case "ANDROID":
          NativeAPI.getLastLocationAndroid();
          break;
        default:
          break;
      }
    } else {
      // 停止获取位置轮询
      GlobalData.Instance.stopGetLocationTimer();
      // 用户已拒绝授权，需要引导用户去设置中打开定位权限
      CommonDailogHandler.showDialogMsgCallback(
        {
          message:
            resultObj.system == "IOS"
              ? "游戏需要定位，请在[设置-隐私-定位服务]中允许本应用使用定位服务"
              : "游戏需要定位，请在[设置-应用-权限管理]中允许本应用使用定位服务",
          confirmText: resultObj.system == "IOS" ? "去设置" : "确定",
          tips: "定位权限未被允许",
        },
        () => {
          switch (resultObj.system) {
            case "IOS":
              NativeAPI.openLocationSettingsIOS();
              break;
            case "ANDROID":
              NativeAPI.openLocationSettingsAndroid();
              break;
            default:
              break;
          }
        },
      );
    }
  }

  /**
   * Android获取当前位置
   */
  public static getLastLocationAndroid() {
    const locationString: string = native.reflection.callStaticMethod(
      "com/cocos/game/AppActivity",
      "getLastLocation",
      "()Ljava/lang/String;",
    );
    Logger.log("getLastLocationAndroid--->", locationString);
    const location = JSON.parse(locationString) as {
      error: ANDROID_LOCATION_STATUS | undefined;
      latitude: number; // 纬度
      longitude: number; // 经度
    };
    if (!location.error) {
      NativeAPI.onLocationChanged(location.latitude, location.longitude);
    }
    return location;
  }

  /**
   * IOS获取当前位置信息
   */
  public static getLastLocationIOS() {
    // @ts-ignore
    const locationString: string = native.reflection.callStaticMethod(
      "AppDelegate",
      "getLastLocation",
    );
    const location = JSON.parse(locationString) as {
      error: IOS_LOCATION_STATUS | undefined;
      latitude: number; // 纬度
      longitude: number; // 经度
    };
    return location;
  }

  /**
   * 监听位置变化
   * @param latitude
   * @param longitude
   */
  public static onLocationChanged(latitude: number, longitude: number) {
    const location = {
      latitude,
      longitude,
    };
    Logger.log("onLocationChanged--->", location);
    // 更新位置信息
    GlobalData.Instance.setLastKnownLocation(location);
  }

  /**
   * IOS打开定位设置页面
   */
  public static openLocationSettingsIOS() {
    // @ts-ignore
    native.reflection.callStaticMethod("AppDelegate", "openLocationSettings");
  }

  /**
   * Android定位设置页面
   */
  public static openLocationSettingsAndroid() {
    // TODO
    // native.reflection.callStaticMethod(
    //   "com/cocos/game/AppActivity",
    //   "openLocationSettings",
    //   "()V"
    // );
  }
}
