import { Logger } from "../../Utils/Logger";
import { Socket } from "socket.io-client";
import { ComponentManager } from "../../Runtime/ComponentManager";
import { Gateway } from "../../Types/typing";
import { GlobalData } from "../../Runtime/GlobalData";
import SocketManager from "./SocketManager";
import CommonDailogHandler from "../../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../../UiScripts/Prefabs/Common/CircleLoadingUI_Component";
import { IN_GAME_TYPE, RESPONE_RESULT } from "../../Enums";
import { PlazaMainUI_Component } from "../../UiScripts/Prefabs/Plaza/PlazaMainUI_Component";
import { PLAZA_EVENT } from "../../Enums/Events/Plaza";
import { ClubMainUI_Component } from "../../UiScripts/Prefabs/Club/ClubMainUI_Component";
import { InviteUI_Component } from "../../UiScripts/Prefabs/Plaza/InviteUI_Component";
import ClubEvents from "./ClubEvents";
import DicesGameEvents from "./DicesGameEvents";
import { DicesGameMainUI_Component } from "../../UiScripts/Prefabs/DicesGame/DicesGameMainUI_Component";

/**
 * 大厅事件处理类
 */
export default class PlazaEvents {
  // 事件映射表
  private static _eventsMap: Map<
    PLAZA_EVENT,
    (data: Gateway.Returned.Common.Result<any>) => void
  > = new Map<PLAZA_EVENT, (data: Gateway.Returned.Common.Result<any>) => void>(
    [
      [PLAZA_EVENT.MAIN_CONNECTED_RESULT, this.onMainConnectedResult],
      [PLAZA_EVENT.INCOMING_CLUB_HINT_RESULT, this.onIncomingClubHintResult],
      [PLAZA_EVENT.APPLY_CLUB_JOIN_RESULT, this.onApplyClubJoinResult],
      [PLAZA_EVENT.APPLY_CLUB_QUIT_RESULT, this.onApplyClubQuitResult],
      [PLAZA_EVENT.GET_CURRENT_PLAYER_RESULT, this.onGetCurrentPlayerResult],
      [PLAZA_EVENT.CHANGE_NICKNAME_RESULT, this.onChangeNicknameResult],
      [PLAZA_EVENT.SET_CUSTOM_AVATAR_RESULT, this.onSetCustomAvatarResult],
      [PLAZA_EVENT.BIND_AGENT_RESULT, this.onBindAgentResult],
      [PLAZA_EVENT.GET_MARQUEES_RESULT, this.onGetMarqueesResult],
      [PLAZA_EVENT.GET_CUSTOMER_SERVICE_RESULT, this.onGetCustomerServiceResult],
      // NOTE - 此版本忽略
      // [PLAZA_EVENT.GET_CLUB_HAS_HINT_RESULT, this.onGetClubHasHintResult],
      [PLAZA_EVENT.GAME_RECONNECT_RESULT, this.onGameReconnectResult],
    ],
  );

  /**
   * 监听所有大厅事件
   * @param SocketInstance
   */
  public static setPlazaEventsOn(SocketInstance: Socket) {
    // 批量绑定事件监听器
    for (const [eventName, listener] of this._eventsMap) {
      SocketInstance.on(eventName, listener);
    }
  }

  /**
   * 取消监听所有大厅事件
   * @param SocketInstance
   */
  public static setPlazaEventsOff(SocketInstance: Socket) {
    // 批量解绑事件监听器
    for (const eventName in this._eventsMap) {
      const listener = this._eventsMap[eventName];
      SocketInstance.off(eventName, listener);
    }
  }

  /**
   * 处理游戏主要连接成功事件
   * @param returnData
   */
  private static onMainConnectedResult(
    returnData: Gateway.Returned.Common.Result<{
      token: string;
      playerInfo: Gateway.Returned.Player.Player;
    }>,
  ) {
    Logger.log("<PlazaEvent> onMainConnectedResult called!", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 连接成功，保存token
      ComponentManager.Instance.setDataToStorage("token", data.token);

      // 挂载游戏大厅界面
      ComponentManager.Instance.renderUiNode<PlazaMainUI_Component>(
        "PlazaMainUI",
        "Prefabs",
        "Plaza/PlazaMainUI",
        PlazaMainUI_Component,
      );

      // 保存玩家信息到全局数据管理触发更新相关信息
      GlobalData.Instance.setCurrentPlayerInfo(data.playerInfo);

      // 销毁登录注册界面
      ComponentManager.Instance.destroyNodeByName("LoginRegisterUI");

      // 判断玩家是否存在游戏状态
      if (
        data.playerInfo.in_game_type &&
        data.playerInfo.in_game_type !== IN_GAME_TYPE.NONE
      ) {
        // 游戏重连
        PlazaEvents.gameReconnect();
      } else {
        // 判断登陆前是否已经在俱乐部中
        const currentClub = GlobalData.Instance.getCurrentClubInfoDetail();
        if (currentClub) {
          // 处理进入俱乐部
          ClubEvents.enterClub(currentClub.club_id);
          Logger.log(`当前俱乐部记录存在，处理进入俱乐部`);
        }
      }
      // 隐藏加载动画
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOGIN);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
      // 隐藏加载动画
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LOGIN);
    }
  }

  /**
   * 接收到有俱乐部提示信息
   * @param returnData
   */
  private static onIncomingClubHintResult(
    returnData: Gateway.Returned.Common.Result<{
      club_id: number;
      joinCount: number;
      quitCount: number;
    }>,
  ) {
    Logger.log("<PlazaEvent> onIncomingClubHintResult called!");
    const { code, data, msg } = returnData;
    // PlazaEvents.getClubHasHint();
    // 判断如果在俱乐部界面，则更新相应的toggle上的申请标记
    const [node, component] = ComponentManager.Instance.getNodeComponent(
      "ClubMainUI",
      ClubMainUI_Component,
    );
    component && component.setApplicationHint(data);
  }

  /**
   * 处理审核加入俱乐部结果
   * @param returnData
   */
  private static onApplyClubJoinResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    Logger.log("<PlazaEvent> onApplyClubJoinResult called!");
    const [node, component] = ComponentManager.Instance.getNodeComponent(
      "ClubMainUI",
      ClubMainUI_Component,
    );
    const isInGame = GlobalData.Instance.getCurrentGameInfo();
    if (node && node.active === true && !isInGame) {
      // 处理申请加入俱乐部审核结果
      if (returnData.code === RESPONE_RESULT.SUCCESS && returnData.data) {
        // 同意加入,获取俱乐部列表
        ClubEvents.getPlayerClubList();
      } else if (
        returnData.code === RESPONE_RESULT.SUCCESS &&
        returnData.data === false
      ) {
        // 申请失败，气泡提示
        CommonDailogHandler.showBubbleMessage(`管理员拒绝您加入俱乐部`);
      }
    }
  }

  /**
   * 处理审核退出俱乐部结果
   * TODO 这里只需要刷新界面即可
   * @param returnData
   */
  private static onApplyClubQuitResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    Logger.log("<PlazaEvent> onApplyClubQuitResult called!");
    const [clubMainUi, clubMainUiComponent] =
      ComponentManager.Instance.getNodeComponent(
        "ClubMainUI",
        ClubMainUI_Component,
      );
    if (clubMainUi && clubMainUi.active === true) {
      // 处理申请退出俱乐部审核结果
      if (returnData.code === RESPONE_RESULT.SUCCESS && returnData.data) {
        // 同意退出
        clubMainUiComponent.close();
      } else if (
        returnData.code === RESPONE_RESULT.SUCCESS &&
        returnData.data === false
      ) {
        // 申请失败，气泡提示
        CommonDailogHandler.showBubbleMessage(`管理员拒绝您退出俱乐部`);
      }
    }
  }

  /**
   * 获取当前玩家信息
   */
  public static getCurrentPlayer() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.GET_CURRENT_PLAYER);
      socket.emit(PLAZA_EVENT.GET_CURRENT_PLAYER);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_CURRENT_PLAYER);
    }
  }

  /**
   * 处理获取当前玩家信息事件
   * @param returnData
   */
  private static onGetCurrentPlayerResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Player.Player>,
  ) {
    Logger.log("<PlazaEvent> onGetCurrentPlayer called!");
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 保存玩家信息到全局数据管理触发更新相关信息
      GlobalData.Instance.setCurrentPlayerInfo(data);
      // 重新渲染大厅左上角玩家信息（含房卡数量）
      const [plazaMainUiNode, plazaMainUiComponent] =
        ComponentManager.Instance.getNodeComponent(
          "PlazaMainUI",
          PlazaMainUI_Component,
        );
      plazaMainUiComponent && plazaMainUiComponent.renderPlayerInformation(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_CURRENT_PLAYER);
  }

  /**
   * 玩家修改昵称
   * @param nickname
   */
  public static changeNickname(nickname: string) {
    const socket = SocketManager.Instance.SocketInstance;
    const params: Gateway.Requested.Player.ChangeNicknameParams = {
      nickname,
    };
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.CHANGE_NICKNAME);
      socket.emit(PLAZA_EVENT.CHANGE_NICKNAME, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CHANGE_NICKNAME);
    }
  }

  /**
   * 处理玩家修改昵称事件
   * @param returnData
   */
  private static onChangeNicknameResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Player.Player>,
  ) {
    Logger.log("<PlazaEvent> onChangeNicknameResult called!");
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 保存玩家信息到全局数据管理触发更新相关信息
      GlobalData.Instance.setCurrentPlayerInfo(data);
      CommonDailogHandler.showBubbleMessage(`修改成功`);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CHANGE_NICKNAME);
  }

  /**
   * 玩家设置自定义头像
   */
  public static setCustomAvatar(avatar: string) {
    const socket = SocketManager.Instance.SocketInstance;
    const params: Gateway.Requested.Player.SetCustomAvatarParams = {
      avatar,
    };
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.CUSTOM_AVATAR);
      socket.emit(PLAZA_EVENT.SET_CUSTOM_AVATAR, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CUSTOM_AVATAR);
    }
  }

  /**
   * 处理玩家设置自定义头像事件
   * @param returnData
   */
  private static onSetCustomAvatarResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Player.Player>,
  ) {
    Logger.log("<PlazaEvent> onSetCustomAvatarResult called!");
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 保存玩家信息到全局数据管理触发更新相关信息
      GlobalData.Instance.setCurrentPlayerInfo(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CUSTOM_AVATAR);
  }

  /**
   * 玩家绑定代理
   */
  public static bindAgent(invite_code: number) {
    const socket = SocketManager.Instance.SocketInstance;
    const params: Gateway.Requested.Player.BindAgentParams = {
      invite_code,
    };
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.BINDING_AGENT);
      socket.emit(PLAZA_EVENT.BIND_AGENT, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.BINDING_AGENT);
    }
  }

  /**
   * 处理玩家绑定代理事件
   * @param returnData
   */
  private static onBindAgentResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Player.Player>,
  ) {
    Logger.log("<PlazaEvent> onSetCustomAvatarResult called!");
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 保存玩家信息到全局数据管理触发更新相关信息
      GlobalData.Instance.setCurrentPlayerInfo(data);
      const [, component] = ComponentManager.Instance.getNodeComponent(
        "InviteUI",
        InviteUI_Component,
      );
      component.renderPlayerInfo();

      CommonDailogHandler.showBubbleMessage(`绑定成功`);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.BINDING_AGENT);
  }

  /**
   * 获取跑马灯信息
   */
  public static getMarquees() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      socket.emit(PLAZA_EVENT.GET_MARQUEES);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
    }
  }

  /**
   * 处理获取跑马灯信息事件
   * @param returnData
   */
  private static onGetMarqueesResult(
    returnData: Gateway.Returned.Common.Result<string[]>,
  ) {
    if (returnData.code === RESPONE_RESULT.SUCCESS) {
      // 响应界面
      const [plazaMainUiNode, plazaMainUiComponent] =
        ComponentManager.Instance.getNodeComponent(
          "PlazaMainUI",
          PlazaMainUI_Component,
        );
      if (plazaMainUiComponent) {
        plazaMainUiComponent.renderMarquees(returnData.data);
      }
    } else {
      // 获取失败，气泡提示
      CommonDailogHandler.showBubbleMessage(`错误：${returnData.msg}`);
    }
  }

  /**
   * 获取客服信息
   */
  public static getCustomerService() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      socket.emit(PLAZA_EVENT.GET_CUSTOMER_SERVICE);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
    }
  }

  /**
   * 处理获取客服信息事件
   * @param returnData
   */
  private static onGetCustomerServiceResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Common.CustomerService>,
  ) {
    if (returnData.code === RESPONE_RESULT.SUCCESS) {
      // 保存客服信息到全局数据，供客服界面读取
      GlobalData.Instance.setCustomerService(returnData.data);
    } else {
      // 获取失败，气泡提示
      CommonDailogHandler.showBubbleMessage(`错误：${returnData.msg}`);
    }
  }

  // // NOTE - 此版本忽略
  // /**
  //  * 获取是否有俱乐部提示
  //  */
  // public static getClubHasHint() {
  //   const socket = SocketManager.Instance.SocketInstance;
  //   if (socket) {
  //     socket.emit(PLAZA_EVENT.GET_CLUB_HAS_HINT);
  //   } else {
  //     CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
  //   }
  // }
  // // NOTE - 此版本忽略
  // /**
  //  * 处理是否有俱乐部提示事件
  //  * @param returnData
  //  */
  // private static onGetClubHasHintResult(
  //   returnData: Gateway.Returned.Common.Result<boolean>,
  // ) {
  //   if (returnData.code === RESPONE_RESULT.SUCCESS) {
  //     // 响应大厅界面
  //     const [plazaMainUiNode, plazaMainUiComponent] =
  //       ComponentManager.Instance.getNodeComponent(
  //         "PlazaMainUI",
  //         PlazaMainUI_Component,
  //       );
  //     if (plazaMainUiComponent) {
  //       plazaMainUiComponent.setClubHasHint(returnData.data);
  //     }

  //     // 响应俱乐部大厅列表界面
  //     const clubListMainUINode =
  //       ComponentManager.Instance.getNode("ClubListMainUI");
  //     // 如果存在，则刷新界面
  //     clubListMainUINode &&
  //       clubListMainUINode.active === true && // 判断是否激活
  //       ClubEvents.getPlayerClubList();
  //     // 响应俱乐部大厅界面
  //     const clubMainUiNode = ComponentManager.Instance.getNode("ClubMainUI");
  //     clubMainUiNode &&
  //       clubMainUiNode.active === true &&
  //       ClubEvents.getCurrentClubHints();
  //   }
  // }

  /**
   * 连接恢复后统一恢复业务数据（供重连成功 / 回到前台检测调用）
   *
   * NOTE - 不能用 playerInfo.in_game_type 判断是否在对局中：
   * onGameReconnectResult 结束时会把它重置为 IN_GAME_TYPE.NONE。
   * 以"游戏主界面是否已存在"为准最可靠。
   */
  public static resumeAfterReconnect() {
    const [, dicesGameComponent] =
      ComponentManager.Instance.getNodeComponent(
        "DicesGameMainUI",
        DicesGameMainUI_Component,
      );

    if (dicesGameComponent) {
      // 已在游戏界面：直接拉取房间状态。
      // 结果由 onGetClubGamingStatusResult 驱动 updateGameStatus 刷新界面；
      // 若房间已不存在，服务端返回失败并自动关闭游戏界面。
      Logger.log("<PlazaEvent> 已在游戏界面，直接获取游戏状态！");
      DicesGameEvents.getClubGamingStatus();
      return;
    }

    // 不在游戏界面：询问服务端当前是否在对局中，是则进入游戏界面
    PlazaEvents.gameReconnect();
  }

  /**
   * 游戏重连
   */
  public static gameReconnect() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.GAME_RECONNECT);
      socket.emit(PLAZA_EVENT.GAME_RECONNECT);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GAME_RECONNECT);
    }
  }

  /**
   * 处理游戏重连事件
   * @param returnData
   */
  public static onGameReconnectResult(
    // TODO - 根据游戏类型返回不同的数据
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.GameReconnectResultData<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>
    >,
  ) {
    Logger.log("<PlazaEvent> onGameReconnectResult called!");
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 处理重连成功逻辑
      Logger.log(`<PlazaEvent> onGameReconnectResult data--->`, data);
      // 保存游戏信息
      GlobalData.Instance.setCurrentGameInfo(data);

      // TODO - 根据游戏类型进入不同的游戏界面（需要判断一下是不是已经在游戏场景中）
      switch (data.in_game_type) {
        case IN_GAME_TYPE.PUBLIC_DICES_GAME:
          Logger.log(`处理重连进入大厅骰子游戏`);
          break;
        case IN_GAME_TYPE.CLUB_DICES_GAME:
          // 根据游戏类型进入不同的游戏界面
          let [dicesGameRoomUi, dicesGameRoomUiComponent, created] =
            ComponentManager.Instance.renderUiNode<DicesGameMainUI_Component>(
              "DicesGameMainUI",
              "Prefabs",
              "DicesGame/DicesGameMainUI",
              DicesGameMainUI_Component,
            );
          if (!created) {
            Logger.log(`已在游戏界面，手动获取游戏状态！`);
            // 复用已有界面时 start() 不会执行，需手动拉一次房间状态。
            // （DicesGameMainUI_Component 上并没有 getGamingStatus 方法，
            //   正确入口是静态方法 DicesGameEvents.getClubGamingStatus）
            DicesGameEvents.getClubGamingStatus();
          }
          break;
        default:
          break;
      }
      CommonDailogHandler.showBubbleMessage(`游戏已为您重新连接！`);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    // 重置标志
    const currentPlayer = GlobalData.Instance.getCurrentPlayerInfo();
    currentPlayer.in_game_type = IN_GAME_TYPE.NONE;
    currentPlayer.in_game_room_id = 0;
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GAME_RECONNECT);
  }
}
