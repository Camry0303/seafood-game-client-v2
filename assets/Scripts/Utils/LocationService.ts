import { native, sys } from "cc";
import { Logger } from "./Logger";
import { Common } from "../Types/typing";
import NativeAPI from "./NativeAPI";
import { ANDROID_LOCATION_STATUS, IOS_LOCATION_STATUS } from "../Enums";
import { GlobalData } from "../Runtime/GlobalData";
import moment from "moment";
import CommonDailogHandler from "./CommonDailogHandler";
import { WAITING_TYPE } from "../UiScripts/Prefabs/Common/CircleLoadingUI_Component";

/**
 * 位置服务工具类
 */
export default class LocationService {
  public static isAndroid = sys.isNative && sys.os === sys.OS.ANDROID;
  public static isIOS = sys.isNative && sys.os === sys.OS.IOS;

  /**
   * 获取最新位置信息
   */
  public static async getLatestLocation(): Promise<Common.Location> {
    try {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.GET_LOCATION);
      const lastKnownlocation = GlobalData.Instance.getLastKnownLocation();
      // 判断上次定位信息是否存在
      if (lastKnownlocation) {
        // 判断上次定位信息是否过期 (有效期5分钟)
        const isExpried =
          moment().diff(lastKnownlocation.lastUpdateTime, "minutes") > 5;
        if (isExpried) {
          // 如果过期，则清除上次位置
          GlobalData.Instance.setLastKnownLocation(null);
          // 触发获取当前位置
          this.getLastLocationFromNative();
          return await GlobalData.Instance.getLatestLocation();
        } else {
          return {
            latitude: lastKnownlocation.latitude,
            longitude: lastKnownlocation.longitude,
          };
        }
      } else {
        // 触发获取当前位置
        this.getLastLocationFromNative();
        return await GlobalData.Instance.getLatestLocation();
      }
    } catch (error) {
      CommonDailogHandler.showBubbleMessage("定位失败，请检查定位权限后重试！");
      return null;
    } finally {
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_LOCATION);
    }
  }

  /**
   * 从原生中获取定位信息
   * @returns
   */
  private static getLastLocationFromNative(): void {
    if (this.isAndroid) {
      // TODO
      const location_Android = NativeAPI.getLastLocationAndroid();
      Logger.log(
        `location from android--->`,
        JSON.stringify(location_Android),
      );
      if (!location_Android.error) {
        return;
      }
      switch (location_Android.error) {
        case ANDROID_LOCATION_STATUS.DENIED:
          // 用户未选择授权，需要请求授权
          NativeAPI.requestLocationPermissionAndroid();
          break;
        case ANDROID_LOCATION_STATUS.UNAVAILABLE:
          // 用户已拒绝授权，需要引导用户去设置中打开定位权限
          CommonDailogHandler.showDialogMsgCallback(
            {
              message: "请在设置中允许应用使用定位服务",
              confirmText: "去设置",
              tips: "定位权限被拒绝！",
            },
            () => {
              NativeAPI.openLocationSettingsIOS();
            },
          );
          break;
        default:
          break;
      }
      return;
    } else if (this.isIOS) {
      const location_iOS: {
        error: IOS_LOCATION_STATUS | undefined;
        latitude: number; // 纬度
        longitude: number; // 经度
      } = NativeAPI.getLastLocationIOS();
      Logger.log(`location from iOS--->`, JSON.stringify(location_iOS));
      if (!location_iOS.error) {
        return;
      }

      switch (location_iOS.error) {
        case IOS_LOCATION_STATUS.NOT_DETERMINED:
          // 用户未选择授权，需要请求授权
          NativeAPI.requestLocationPermissionIOS();
          break;
        case IOS_LOCATION_STATUS.DENIED:
          // 用户已拒绝授权，需要引导用户去设置中打开定位权限
          CommonDailogHandler.showDialogMsgCallback(
            {
              message: "请在设置中允许应用使用定位服务",
              confirmText: "去设置",
              tips: "定位权限被拒绝！",
            },
            () => {
              NativeAPI.openLocationSettingsIOS();
            },
          );
          break;
        case IOS_LOCATION_STATUS.RESTRICTED:
          // 用户已限制授权，需要引导用户去设置中打开定位权限
          CommonDailogHandler.showDialogMsgCallback(
            {
              message: "请在设置中允许应用使用定位服务",
              confirmText: "去设置",
              tips: "定位权限被限制！",
            },
            () => {
              NativeAPI.openLocationSettingsIOS();
            },
          );
          break;
        case IOS_LOCATION_STATUS.UNKNOW:
          // 未知错误，需要引导用户去设置中打开定位权限
          CommonDailogHandler.showDialogMsgCallback(
            {
              message: "请在设置中允许应用使用定位服务",
              confirmText: "去设置",
              tips: "未知定位权限！",
            },
            () => {
              NativeAPI.openLocationSettingsIOS();
            },
          );
          break;
        case IOS_LOCATION_STATUS.LOCATING:
          // 正在定位
          CommonDailogHandler.showBubbleMessage("正在定位中，请重试...");
        default:
          break;
      }
      return;
    } else {
      CommonDailogHandler.showDialogMessage(
        `抱歉，您当前的设备不支持定位功能！`,
      );
      return;
    }
  }
}
