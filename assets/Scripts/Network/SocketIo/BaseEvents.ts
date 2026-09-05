import { Logger } from "../../Utils/Logger";
import { Socket } from "socket.io-client";

import { ComponentManager } from "../../Runtime/ComponentManager";
import { LoginRegisterMainUI_Component } from "../../UiScripts/Prefabs/LoginRegister/LoginRegisterMainUI_Component";
import SocketManager from "./SocketManager";
import CommonDailogHandler from "../../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../../UiScripts/Prefabs/Common/CircleLoadingUI_Component";

export default class BaseEvents {
  /**
   * 是否已经成功连接过（用于区分"首次连接"与"重连"）
   */
  private static _hasConnectedOnce: boolean = false;

  /**
   * 连接恢复后的业务恢复回调（由上层注册，避免基础层反向依赖业务层）
   */
  private static _onReconnectedCallback: Function = null;

  /**
   * 注册"连接恢复后"的业务回调
   * @param callback
   */
  public static setOnReconnectedCallback(callback: Function) {
    BaseEvents._onReconnectedCallback = callback;
  }

  /**
   * 监听基础事件
   * @param SocketInstance
   */
  public static setBaseEventsOn(SocketInstance: Socket) {
    // 监听连接事件
    SocketInstance.on("connect", this.onConnect);
    // 监听连接错误事件
    SocketInstance.on("connect_error", this.onConnectError);
    // 监听连接断开事件
    SocketInstance.on("disconnect", this.onDisconnect);

    // 监听重连事件
    SocketInstance.io.on("reconnect", this.onReconnect);
    // 监听重连尝试事件
    SocketInstance.io.on("reconnect_attempt", this.onReconnectAttempt);
    // 监听重连错误事件
    SocketInstance.io.on("reconnect_error", this.onReconnectError);
    // 监听重连失败事件
    SocketInstance.io.on("reconnect_failed", this.onReconnectFailed);

    // 监听socket错误事件
    SocketInstance.io.on("error", this.onError);
  }

  /**
   * 取消监听基础事件
   * @param SocketInstance
   */
  public static setBaseEventsOff(SocketInstance: Socket) {
    // 取消监听连接事件
    SocketInstance.off("connect", this.onConnect);
    // 取消监听连接错误事件
    SocketInstance.off("connect_error", this.onConnectError);
    // 取消监听连接断开事件
    SocketInstance.off("disconnect", this.onDisconnect);

    // 取消监听重连事件
    SocketInstance.io.off("reconnect", this.onReconnect);
    // 取消监听重连尝试事件
    SocketInstance.io.off("reconnect_attempt", this.onReconnectAttempt);
    // 取消监听重连错误事件
    SocketInstance.io.off("reconnect_error", this.onReconnectError);
    // 取消监听重连失败事件
    SocketInstance.io.off("reconnect_failed", this.onReconnectFailed);

    // 取消监听socket错误事件
    SocketInstance.io.off("error", this.onError);
  }

  /**
   * 处理连接成功
   */
  private static async onConnect() {
    Logger.log(`<SocketBaseEvent> onConnect--->`, `游戏网关服务连接成功！`);
    // 连接成功，证明登录成功了，关闭加载动画
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOGIN);

    if (BaseEvents._hasConnectedOnce) {
      // 非首次连接（自动重连或强制重连成功）：恢复业务数据（房间状态等）
      // NOTE - socket.io 重连成功时 connect 与 reconnect 都会触发，
      // 业务恢复统一放这里，onReconnect 内不再重复调用。
      if (typeof BaseEvents._onReconnectedCallback === "function") {
        BaseEvents._onReconnectedCallback();
      }
    }
    BaseEvents._hasConnectedOnce = true;
  }

  /**
   * 处理连接错误
   */
  private static async onConnectError(returnData: Error) {
    Logger.log(`<SocketBaseEvent> onConnectError--->`, returnData.message);
    let msg = returnData.message;
    const cause = returnData.message.split(":")[1];
    // 是否需要显示登录注册界面
    let needLoginUi = false;

    switch (cause) {
      case "missing sign!":
        // 缺少签名，需要加载登录注册界面
        needLoginUi = true;
        msg = "缺少签名，请重新登录！";
        break;
      case "missing time!":
        // 缺少请求时间，需要加载登录注册界面
        needLoginUi = true;
        msg = "缺少请求时间，请重新登录！";
        break;
      case "missing token!":
        // 缺少token，需要加载登录注册界面
        needLoginUi = true;
        msg = "缺少token，请重新登录！";
        break;
      case "sign verify failed!":
        // 签名验证失败，需要加载登录注册界面
        needLoginUi = true;
        msg = "签名验证失败，请重新登录！";
        break;
      case "token verify failed!":
        // token验证失败，需要加载登录注册界面
        needLoginUi = true;
        // 删除不合法的token
        ComponentManager.Instance.deleteDataFromStorage("token");
        msg = "登录信息过期，请重新登录！";
        break;
      default:
        needLoginUi = false;
        msg = `游戏网关服务连接错误！\n\r${msg}`;
        break;
    }
    if (needLoginUi) {
      // 挂载渲染登录注册界面
      ComponentManager.Instance.renderUiNode<LoginRegisterMainUI_Component>(
        "LoginRegisterMainUI",
        "Prefabs",
        "LoginRegister/LoginRegisterMainUI",
        LoginRegisterMainUI_Component,
      );

      // 登录失败了，关闭加载动画
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOGIN);
    } else {
      // 显示加载动画
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOGIN);
    }
    // 提示玩家连接错误
    CommonDailogHandler.showDialogMessage(`${msg}`);
  }

  /**
   * 处理断开连接
   * @param returnData
   */
  private static async onDisconnect(returnData: any) {
    Logger.log(`<SocketBaseEvent> onDisconnect--->`, String(returnData));

    switch (String(returnData)) {
      case "io client disconnect":
        // 如果非客户端主动断开连接，则需要加载动画
        if (ComponentManager.Instance.getDataFromStorage("token")) {
          CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOGIN);
        } else {
          CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOGIN);
        }
        break;
      case "io server disconnect":
        // 服务器主动断开连接，无需重连，处理token过期
        ComponentManager.Instance.deleteDataFromStorage("token");
        SocketManager.Instance.refleshToken();

        // 挂载渲染登录注册界面
        ComponentManager.Instance.renderUiNode<LoginRegisterMainUI_Component>(
          "LoginRegisterMainUI",
          "Prefabs",
          "LoginRegister/LoginRegisterMainUI",
          LoginRegisterMainUI_Component,
        );
        CommonDailogHandler.showDialogMessage("游戏网关服务断开与您的连接！");
        // // 不需要处理加载动画
        // CommonDailogHandler.hideCircleLoading();
        break;
      case "ping timeout":
        // 客户端超时网络断开，需要加载动画
        CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOGIN);
        // 重新设置最新的token 重连时会带最新token
        SocketManager.Instance.refleshToken();
        break;
      case "transport error":
        // 客户端网络断开，需要加载动画
        CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOGIN);
        // 重新设置最新的token 重连时会带最新token
        SocketManager.Instance.refleshToken();
        break;
      case "transport close":
        // 服务端服务意外关闭，需要加载动画
        CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOGIN);
        // 重新设置最新的token 重连时会带最新token
        SocketManager.Instance.refleshToken();
        break;
      default:
        CommonDailogHandler.showCircleLoading(WAITING_TYPE.LOGIN);
        CommonDailogHandler.showDialogMessage("游戏网关服务连接已断开！");
        break;
    }
  }

  /**
   * 处理重新连接成功
   * @param returnData 返回重连次数
   */
  private static async onReconnect(returnData: any) {
    Logger.log(`<SocketBaseEvent> onReconnect--->`, returnData);
    Logger.log("游戏网关服务重连成功！");
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SOCKET_RECONNECT);
    // 业务恢复统一交给 onConnect（重连成功时二者都会触发，此处不再重复处理）
  }

  /**
   * 处理尝试重新连接
   * @param returnData 返回重连次数
   */
  private static async onReconnectAttempt(returnData: any) {
    Logger.log(`<SocketBaseEvent> onReconnectAttempt--->`, returnData);
    Logger.log(`游戏网关服务正在尝试第${returnData}次重连！`);
    CommonDailogHandler.showCircleLoading(WAITING_TYPE.SOCKET_RECONNECT);
  }

  /**
   * 处理重新连接错误
   */
  private static async onReconnectError(returnData: Error) {
    Logger.log(`<SocketBaseEvent> onReconnectError--->`, returnData);
    CommonDailogHandler.showDialogMessage(
      `游戏网关服务重连错误，\n\r${returnData.message}`,
    );
  }

  /**
   * 处理重新连接失败
   */
  private static async onReconnectFailed() {
    Logger.log(`<SocketBaseEvent> onReconnectFailed--->`, "重连失败！");
    CommonDailogHandler.showBubbleMessage(
      "游戏网关服务重连失败，请检查网络设置！",
    );
  }

  /**
   * 处理socket错误
   * @param returnData
   */
  private static async onError(returnData: Error) {
    Logger.log(`<SocketBaseEvent> onError--->`, returnData);
    CommonDailogHandler.showDialogMessage(
      `游戏网关服务连接出错，\n\r${returnData.message}`,
    );
  }

  // /**
  //  * 处理检查版本号结果事件
  //  * @param returnData
  //  */
  // private static async onVersionResult(
  //   returnData: Result<{ buildVersion: string; hotVersion: string }>
  // ) {
  //   cc.log("onVersionResult", returnData);
  //   const { code, data, msg } = returnData;
  //   cc.log("onVersionResult", ConfigDataManager.Instance.buildVersion);
  //   cc.log("onVersionResult", ConfigDataManager.Instance.hotVersion);
  //   if (data.buildVersion !== ConfigDataManager.Instance.buildVersion) {
  //     ComponentManager.Instance.CommonPopUpComponent.showTextDisplayBox({
  //       title: "提示",
  //       options: {
  //         defaultValue: `游戏版本过低！请复制最新下载链接进行下载安装；或联系微信客服：\n${ConfigDataManager.Instance.serviceWechatList[0]} \n以获取最新安装包！`,
  //         maxLength: 500,
  //         height: 300,
  //         isAllowEmpty: true,
  //         confirmText: "复制并退出",
  //         hideClose: true,
  //       },
  //       callBack: () => {
  //         ClipboardManager.Instance.copyTextToClipboard(
  //           ConfigDataManager.Instance.downloadLink
  //         );
  //         ComponentManager.Instance.CommonPopUpComponent.showBubbleMessage(
  //           `下载链接复制成功！即将退出游戏！`
  //         );
  //         setTimeout(() => {
  //           cc.game.end();
  //         }, 500);
  //       },
  //     });
  //     return;
  //   }
  //   if (data.hotVersion !== ConfigDataManager.Instance.hotVersion) {
  //     ComponentManager.Instance.CommonPopUpComponent?.showConfirmBox({
  //       title: "游戏更新",
  //       text: `发现新的游戏更新包，确定马上更新吗？`,
  //       callBack: (event: any) => {
  //         // 重新开始游戏，进入更新！
  //         cc.game.restart();
  //       },
  //     });
  //     return;
  //   }
  // }
}
