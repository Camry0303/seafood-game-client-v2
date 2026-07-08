import { Socket } from "socket.io-client";
import { Gateway } from "../../Types/typing";
import SocketManager from "./SocketManager";
import { ComponentManager } from "../../Runtime/ComponentManager";
import { GlobalData } from "../../Runtime/GlobalData";
import CommonDailogHandler from "../../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../../UiScripts/Prefabs/Common/CircleLoadingUI_Component";
import PlazaEvents from "./PlazaEvents";
import { CLUB_EVENT } from "../../Enums/Events/Club";
import {
  CLUB_APPLICATION_TYPE,
  GAME_TYPE,
  JOIN_CLUB_RESULT,
  QUIT_CLUB_RESULT,
  RESPONE_RESULT,
} from "../../Enums";
import { ClubMainUI_Component } from "../../UiScripts/Prefabs/Club/ClubMainUI_Component";
import { ApplicationUI_Component } from "../../UiScripts/Prefabs/Club/ApplicationUI_Component";
import { MemberManagementUI_Component } from "../../UiScripts/Prefabs/Club/MemberManagementUI_Component";
import { MemberListUI_Component } from "../../UiScripts/Prefabs/Club/MemberListUI_Component";
import { PartnerListUI_Component } from "../../UiScripts/Prefabs/Club/PartnerListUI_Component";
import { PartnerMemberListUI_Component } from "../../UiScripts/Prefabs/Club/PartnerMemberListUI_Component";
import { MemberScoreLogListUI_Component } from "../../UiScripts/Prefabs/Club/MemberScoreLogListUI_Component";
import { MemberScoreRankListUI_Component } from "../../UiScripts/Prefabs/Club/MemberScoreRankListUI_Component";
import { MyMemberListUI_Component } from "../../UiScripts/Prefabs/Club/MyMemberListUI_Component";
import { DicesGameRecordUI_Component } from "../../UiScripts/Prefabs/Common/DicesGameRecordUI_Component";

/**
 * 俱乐部事件处理类
 */
export default class ClubEvents {
  // 事件映射表
  private static _eventsMap: Map<
    CLUB_EVENT,
    (data: Gateway.Returned.Common.Result<any>) => void
  > = new Map<CLUB_EVENT, (data: Gateway.Returned.Common.Result<any>) => void>([
    [CLUB_EVENT.GET_PLAYER_CLUB_LIST_RESULT, this.onGetPlayerClubListResult],
    [CLUB_EVENT.CREATE_CLUB_RESULT, this.onCreateClubResult],
    [CLUB_EVENT.JOIN_CLUB_BY_ID_RESULT, this.onJoinClubByIdResult],
    [CLUB_EVENT.QUIT_CLUB_RESULT, this.onQuitClubResult],
    [CLUB_EVENT.ENTER_CLUB_RESULT, this.onEnterClubResult],
    [CLUB_EVENT.LEAVE_CLUB_RESULT, this.onLeaveClubResult],

    [
      CLUB_EVENT.QUERY_CLUB_PLAYER_UNREVIEWED_APPLICATION_LIST_RESULT,
      this.onQueryClubPlayrUnreviewedApplicationListResult,
    ],
    [
      CLUB_EVENT.REVIEW_CLUB_PLAYER_APPLICATION_RESULT,
      this.onReviewClubPlayerApplicationResult,
    ],

    [CLUB_EVENT.INVITE_PLAYER_TO_CLUB_RESULT, this.onInvitePlayerToClubResult],

    [CLUB_EVENT.CHANGE_NAME_RESULT, this.onChangeClubNameResult],
    [
      CLUB_EVENT.CHANGE_ANNOUNCEMENT_RESULT,
      this.onChangeClubAnnouncementResult,
    ],
    [CLUB_EVENT.SET_SUB_ADMIN_RESULT, this.onSetSubAdminResult],

    [
      CLUB_EVENT.GET_MEMBER_MANAGEMENT_LIST_RESULT,
      this.onGetMemberManagementListResult,
    ],
    [
      CLUB_EVENT.CHANGE_CLUB_PLAYER_SCORE_RESULT,
      this.onChangeClubPlayerScoreResult,
    ],

    [CLUB_EVENT.GET_MEMBER_LIST_RESULT, this.onGetMemberListResult],
    [
      CLUB_EVENT.DEMOTE_OR_DELETE_MEMBER_RESULT,
      this.onDemoteOrDeleteMemberResult,
    ],

    [CLUB_EVENT.GET_PARTNER_LIST_RESULT, this.onGetPartnerListResult],
    [CLUB_EVENT.ADD_PARTNER_RESULT, this.onAddPartnerResult],
    [CLUB_EVENT.DELETE_PARTNER_RESULT, this.onDeletePartnerResult],

    [
      CLUB_EVENT.GET_PARTNER_MEMBER_LIST_RESULT,
      this.onGetPartnerMemberListResult,
    ],
    [CLUB_EVENT.ADD_PARTNER_MEMBER_RESULT, this.onAddPartnerMemberResult],
    [CLUB_EVENT.DELETE_PARTNER_MEMBER_RESULT, this.onDeletePartnerMemberResult],

    [
      CLUB_EVENT.GET_CLUB_PLAYER_SCORE_LOG_LIST_RESULT,
      this.onGetClubPlayerScoreLogListResult,
    ],

    [
      CLUB_EVENT.GET_CLUB_PLAYER_SCORE_RANK_LIST_RESULT,
      this.onGetClubPlayerScoreRankListResult,
    ],
    [CLUB_EVENT.GET_MY_MEMBER_LIST_RESULT, this.onGetMyMemberListResult],

    [
      CLUB_EVENT.GET_CLUB_GAME_ROOM_LIST_RESULT,
      this.onGetClubGameRoomListResult,
    ],
    [CLUB_EVENT.ROOM_DISSOLVED_RESULT, this.onRoomDissolvedResult],
    [CLUB_EVENT.ROOM_CREATED_RESULT, this.onRoomCreatedResult],

    [
      CLUB_EVENT.GET_MY_CLUB_DICES_GAME_SETTLEMENT_RESULT,
      this.onGetMyClubDicesGameSettlementResult,
    ],
  ]);

  /**
   * 监听所有俱乐部事件
   * @param SocketInstance
   */
  public static setClubEventsOn(SocketInstance: Socket) {
    // 批量绑定事件监听器
    for (const [eventName, listener] of this._eventsMap) {
      SocketInstance.on(eventName, listener);
    }
  }

  /**
   * 取消监听所有俱乐部事件
   * @param SocketInstance
   */
  public static setClubEventsOff(SocketInstance: Socket) {
    // 批量解绑事件监听器
    for (const eventName in this._eventsMap) {
      const listener = this._eventsMap[eventName];
      SocketInstance.off(eventName, listener);
    }
  }

  /**
   * 获取玩家俱乐部列表
   */
  public static getPlayerClubList() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.GET_PLAYER_CLUB_LIST);
      socket.emit(CLUB_EVENT.GET_PLAYER_CLUB_LIST);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_PLAYER_CLUB_LIST);
    }
  }

  /**
   * 处理获取玩家俱乐部列表结果事件
   * @param returnData
   */
  private static onGetPlayerClubListResult(
    returnData: Gateway.Returned.Common.Result<Gateway.Returned.Club.Club[]>,
  ) {
    console.log(
      "<ClubEvent> onGetPlayerClubListResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 获取俱乐部界面
      const [node, component] =
        ComponentManager.Instance.getNodeComponent<ClubMainUI_Component>(
          "ClubMainUI",
          ClubMainUI_Component,
        );
      // 渲染俱乐部列表菜单
      component.renderClubList(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_PLAYER_CLUB_LIST);
  }

  /**
   * 创建俱乐部
   * @param club_name
   */
  public static createClub(club_name: string) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      const params: Gateway.Requested.Club.CreateClubParams = {
        club_name,
      };
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.CREATE_CLUB);
      socket.emit(CLUB_EVENT.CREATE_CLUB, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_CLUB);
    }
  }

  /**
   * 处理创建俱乐部结果事件
   * @param returnData
   */
  private static onCreateClubResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<ClubEvent> onCreateClubResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 重新请求获取玩家俱乐部列表
      ClubEvents.getPlayerClubList();
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CREATE_CLUB);
  }

  /**
   * 通过俱乐部id加入俱乐部
   * @param club_id
   */
  public static joinClubById(club_id: number) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      const params: Gateway.Requested.Club.JoinClubByIdParams = {
        club_id,
      };
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.JOIN_CLUB_BY_ID);
      socket.emit(CLUB_EVENT.JOIN_CLUB_BY_ID, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.JOIN_CLUB_BY_ID);
    }
  }

  /**
   * 处理通过俱乐部id加入俱乐部结果事件
   * @param returnData
   */
  private static onJoinClubByIdResult(
    returnData: Gateway.Returned.Common.Result<JOIN_CLUB_RESULT>,
  ) {
    console.log("<ClubEvent> onJoinClubByIdResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 判断加入情况
      if (returnData.data === JOIN_CLUB_RESULT.JOIN_SUCCESS) {
        // 重新请求获取玩家俱乐部列表
        ClubEvents.getPlayerClubList();
        CommonDailogHandler.showBubbleMessage(`加入成功！`);
      } else if (returnData.data === JOIN_CLUB_RESULT.APPLY_SUCCESS) {
        // 申请加入成功
        CommonDailogHandler.showBubbleMessage(
          `提交申请成功，请耐心等待俱乐部管理人员审核`,
        );
      }
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.JOIN_CLUB_BY_ID);
  }

  /**
   * 退出俱乐部
   */
  public static quitClub() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.QUIT_CLUB);
      socket.emit(CLUB_EVENT.QUIT_CLUB);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.QUIT_CLUB);
    }
  }

  /**
   * 处理退出俱乐部结果事件
   * @param returnData
   */
  private static onQuitClubResult(
    returnData: Gateway.Returned.Common.Result<QUIT_CLUB_RESULT>,
  ) {
    console.log("<ClubEvent> onQuitClubResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 判断退出情况
      if (data === QUIT_CLUB_RESULT.QUIT_SUCCESS) {
        // @TODO 处理退出俱乐部
      } else if (data === QUIT_CLUB_RESULT.APPLY_SUCCESS) {
        // 申请退出成功
        CommonDailogHandler.showBubbleMessage(`申请成功！请等待同意...`);
      }
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.QUIT_CLUB);
  }

  /**
   * 进入俱乐部
   * @param club_id
   */
  public static enterClub(club_id: number) {
    const socket = SocketManager.Instance.SocketInstance;
    if (!club_id) {
      return;
    }
    if (socket) {
      const params: Gateway.Requested.Club.EnterClubParams = {
        club_id,
      };
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.ENTER_CLUB);
      socket.emit(CLUB_EVENT.ENTER_CLUB, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.ENTER_CLUB);
    }
  }

  /**
   * 处理进入俱乐部结果事件
   * @param returnData
   */
  private static onEnterClubResult(
    returnData: Gateway.Returned.Common.Result<{
      clubInfoDetail: Gateway.Returned.Club.ClubDetail;
      clubPlayerInfo: Gateway.Returned.ClubPlayer.CurrentClubPlayer;
    }>,
  ) {
    console.log("<ClubEvent> onEnterClubResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const { clubInfoDetail, clubPlayerInfo } = data;
      GlobalData.Instance.setCurrentClubInfoDetail(clubInfoDetail);
      GlobalData.Instance.setCurrentClubPlayerInfo(clubPlayerInfo);

      // 进入俱乐部成功
      const [node, component, created] =
        ComponentManager.Instance.renderUiNode<ClubMainUI_Component>(
          "ClubMainUI",
          "Prefabs",
          "Club/ClubMainUI",
          ClubMainUI_Component,
        );

      // 渲染俱乐部详情内容
      component.renderClubDetailContent();

      const currentPlayer = GlobalData.Instance.getCurrentPlayerInfo();
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.ENTER_CLUB);
  }

  /**
   * 离开俱乐部
   */
  public static leaveClub() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.LEAVE_CLUB);
      socket.emit(CLUB_EVENT.LEAVE_CLUB);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LEAVE_CLUB);
    }
  }

  /**
   * 处理离开俱乐部结果事件
   * @param returnData
   */
  private static onLeaveClubResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<ClubEvent> onLeaveClubResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // @TODO 处理离开俱乐部成功
      console.log("离开俱乐部成功:", data);
      GlobalData.Instance.setCurrentClubInfoDetail(null);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.LEAVE_CLUB);
  }

  /**
   * 获取当前俱乐部未审核加入申请列表
   * @param current
   * @param pageSize
   */
  public static queryClubPlayrUnreviewedApplicationList(
    club_id: number,
    current: number = 1,
    pageSize: number = 100,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      const params: Gateway.Requested.ClubPlayerApplication.QueryClubPlayerApplicationListParams =
        {
          club_id: club_id,
          review_status: 0,
          type: CLUB_APPLICATION_TYPE.JOIN,
          current,
          pageSize,
        };
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.QUERY_CLUB_PLAYER_UNREVIEWED_APPLICATION_LIST,
      );
      socket.emit(
        CLUB_EVENT.QUERY_CLUB_PLAYER_UNREVIEWED_APPLICATION_LIST,
        params,
      );
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.QUERY_CLUB_PLAYER_UNREVIEWED_APPLICATION_LIST,
      );
    }
  }

  /**
   * 处理获取当前俱乐部未审核加入申请列表结果事件
   * @param returnData
   */
  private static onQueryClubPlayrUnreviewedApplicationListResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.Pagenation<
        Gateway.Returned.ClubPlayerApplication.ClubPlayerApplication[]
      >
    >,
  ) {
    console.log(
      "<ClubEvent> onQueryClubPlayrUnreviewedApplicationListResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 渲染未审核加入申请列表
      const [node, component] = ComponentManager.Instance.renderUiNode(
        "ApplicationUI",
        "Prefabs",
        "Club/ApplicationUI",
        ApplicationUI_Component,
      );
      component && component.renderUnreviewedApplicationList(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showDialogMessage(`错误：${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(
      WAITING_TYPE.QUERY_CLUB_PLAYER_UNREVIEWED_APPLICATION_LIST,
    );
  }

  /**
   * 审核俱乐部玩家申请单
   * @param application_id
   * @param review_status
   * @param application_type
   */
  public static reviewClubPlayerApplication(
    application_id: number,
    review_status: number,
    application_type: number,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      const params: Gateway.Requested.ClubPlayerApplication.ReviewClubPlayerApplicationParams =
        {
          application_id,
          review_status,
          application_type,
        };
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.REVIEW_CLUB_PLAYER_APPLICATION,
      );
      socket.emit(CLUB_EVENT.REVIEW_CLUB_PLAYER_APPLICATION, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.REVIEW_CLUB_PLAYER_APPLICATION,
      );
    }
  }

  /**
   * 处理审核俱乐部玩家申请结果事件
   * @param returnData
   */
  private static onReviewClubPlayerApplicationResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log(
      "<ClubEvent> onReviewClubPlayerApplicationResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 刷新申请列表
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "ApplicationUI",
        ApplicationUI_Component,
      );
      if (component) {
        const club_id = component.setReviewed();
        const [clubMainNode, clubMainComponent] =
          ComponentManager.Instance.getNodeComponent(
            "ClubMainUI",
            ClubMainUI_Component,
          );
        if (clubMainComponent) {
          clubMainComponent.setApplicationHint(club_id, -1);
        }
      }
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(
      WAITING_TYPE.REVIEW_CLUB_PLAYER_APPLICATION,
    );
  }

  /**
   * 邀请玩家加入俱乐部
   * @param player_id
   */
  public static invitePlayerToClub(player_id: number) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      const params: Gateway.Requested.Club.InvitePlayerToClubParams = {
        player_id,
      };
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.INVITE_PLAYER_TO_CLUB);
      socket.emit(CLUB_EVENT.INVITE_PLAYER_TO_CLUB, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.INVITE_PLAYER_TO_CLUB);
    }
  }

  /**
   * 处理邀请玩家加入俱乐部结果事件
   * @param returnData
   */
  private static onInvitePlayerToClubResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log(
      "<ClubEvent> onInvitePlayerToClubResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 处理邀请玩家加入俱乐部成功结果
      CommonDailogHandler.showBubbleMessage(`邀请成功`);
      // 获取我的成员列表界面
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "MyMemberListUI",
        MyMemberListUI_Component,
      );
      component && component.reloadData();
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.INVITE_PLAYER_TO_CLUB);
  }

  /**
   * 修改俱乐部名称
   * @param club_name
   */
  public static changeClubName(club_name: string) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      const params: Gateway.Requested.Club.ChangeClubNameParams = {
        club_name,
      };
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.CHANGE_CLUB_NAME);
      socket.emit(CLUB_EVENT.CHANGE_NAME, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CHANGE_CLUB_NAME);
    }
  }

  /**
   * 处理修改俱乐部名称结果事件
   * @param returnData
   */
  private static onChangeClubNameResult(
    returnData: Gateway.Returned.Common.Result<{ newClubName: string }>,
  ) {
    console.log("<ClubEvent> onChangeClubNameResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 处理修改俱乐部名称成功结果
      const currentClubInfoDetail =
        GlobalData.Instance.getCurrentClubInfoDetail();

      if (!currentClubInfoDetail) return;

      // 更新最新的俱乐部名称
      currentClubInfoDetail.club_name = data.newClubName;

      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "ClubMainUI",
        ClubMainUI_Component,
      );
      component &&
        component.updateCheckedToggleClubName(
          currentClubInfoDetail.club_id,
          currentClubInfoDetail.club_name,
        );
      CommonDailogHandler.showBubbleMessage(`修改俱乐部成功`);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.CHANGE_CLUB_NAME);
  }

  /**
   * 修改俱乐部公告
   * @param announcement
   */
  public static changeClubAnouncement(announcement: string) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      const params: Gateway.Requested.Club.ChangeClubAnnouncementParams = {
        announcement,
      };
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.CHANGE_CLUB_ANNOUNCEMENT,
      );
      socket.emit(CLUB_EVENT.CHANGE_ANNOUNCEMENT, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.CHANGE_CLUB_ANNOUNCEMENT,
      );
    }
  }

  /**
   * 处理修改俱乐部公告结果事件
   * @param returnData
   */
  private static onChangeClubAnnouncementResult(
    returnData: Gateway.Returned.Common.Result<{
      newAnnouncement: string;
    }>,
  ) {
    console.log(
      "<ClubEvent> onChangeClubAnnouncementResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 处理修改俱乐部公告成功结果
      const currentClubInfoDetail =
        GlobalData.Instance.getCurrentClubInfoDetail();

      if (!currentClubInfoDetail) return;

      // 更新最新的俱乐部公告
      currentClubInfoDetail.announcement = data.newAnnouncement;

      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "ClubMainUI",
        ClubMainUI_Component,
      );
      component &&
        component.updateAnnouncement(currentClubInfoDetail.announcement);
      CommonDailogHandler.showBubbleMessage(`修改成功`);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(
      WAITING_TYPE.CHANGE_CLUB_ANNOUNCEMENT,
    );
  }

  /**
   * 设置副管理员
   * @param params
   */
  public static setSubAdmin(params: Gateway.Requested.Club.SetSubAdminParams) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.SET_SUB_ADMIN);
      socket.emit(CLUB_EVENT.SET_SUB_ADMIN, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SET_SUB_ADMIN);
    }
  }

  /**
   * 处理设置副管理员结果事件
   * @param returnData
   */
  private static onSetSubAdminResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<ClubEvent> onSetSubAdminResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 处理设置副管理员成功结果
      CommonDailogHandler.showBubbleMessage(`设置副管理员成功`);
    } else {
      const message = msg.includes("不存在") ? "被添加的用户不存在" : msg;
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${message}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SET_SUB_ADMIN);
  }

  /**
   * 获取成员管理列表
   * @param params
   */
  public static getMemberManagementList(
    params: Gateway.Requested.ClubPlayer.GetMemberManagementListParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.GET_MEMBER_MANAGEMENT_LIST,
      );
      socket.emit(CLUB_EVENT.GET_MEMBER_MANAGEMENT_LIST, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.GET_MEMBER_MANAGEMENT_LIST,
      );
    }
  }

  /**
   * 处理获取成员管理列表结果事件
   * @param returnData
   */
  private static onGetMemberManagementListResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.Pagenation<
        Gateway.Returned.ClubPlayer.ClubPlayer[]
      >
    >,
  ) {
    console.log(
      "<ClubEvent> onGetMemberManagementListResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      //  打开成员管理界面
      const [node, component] =
        ComponentManager.Instance.renderUiNode<MemberManagementUI_Component>(
          "MemberManagementUI",
          "Prefabs",
          "Club/MemberManagementUI",
          MemberManagementUI_Component,
        );
      component && component.setData(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(
      WAITING_TYPE.GET_MEMBER_MANAGEMENT_LIST,
    );
  }

  /**
   * 成员上下分
   * @param params
   */
  public static changeClubPlayerScore(
    params: Gateway.Requested.ClubPlayer.ChangeClubPlayerScoreParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.CHANGE_CLUB_PLAYER_SCORE,
      );
      socket.emit(CLUB_EVENT.CHANGE_CLUB_PLAYER_SCORE, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.CHANGE_CLUB_PLAYER_SCORE,
      );
    }
  }

  /**
   * 处理成员上下分结果事件
   * @param returnData
   */
  private static onChangeClubPlayerScoreResult(
    returnData: Gateway.Returned.Common.Result<{
      club_id: number;
      player_id: number;
      club_score: number;
    }>,
  ) {
    console.log(
      "<ClubEvent> onChangeClubPlayerScoreResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 处理上下分成功结果

      // 更新最新的俱乐部积分
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "MemberManagementUI",
        MemberManagementUI_Component,
      );

      component &&
        component.updateClubPlayerScore(data.player_id, data.club_score);

      CommonDailogHandler.showBubbleMessage(`操作成功`);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(
      WAITING_TYPE.CHANGE_CLUB_PLAYER_SCORE,
    );
  }

  /**
   * 获取成员列表
   * @param params
   */
  public static getMemberList(
    params: Gateway.Requested.ClubPlayer.GetMemberListParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.GET_MEMBER_LIST);
      socket.emit(CLUB_EVENT.GET_MEMBER_LIST, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_MEMBER_LIST);
    }
  }

  /**
   * 处理获取成员列表结果事件
   * @param returnData
   */
  private static onGetMemberListResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.Pagenation<
        Gateway.Returned.ClubPlayer.ClubPlayer[]
      >
    >,
  ) {
    console.log("<ClubEvent> onGetMemberListResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      //  打开成员列表界面
      const [node, component] =
        ComponentManager.Instance.renderUiNode<MemberListUI_Component>(
          "MemberListUI",
          "Prefabs",
          "Club/MemberListUI",
          MemberListUI_Component,
        );
      component && component.setData(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_MEMBER_LIST);
  }

  /**
   * 降职或删除成员
   * @param params
   */
  public static demoteOrDeleteMember(
    params: Gateway.Requested.ClubPlayer.DemoteOrDeleteMemberParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.DEMOTE_OR_DELETE_MEMBER,
      );
      socket.emit(CLUB_EVENT.DEMOTE_OR_DELETE_MEMBER, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.DEMOTE_OR_DELETE_MEMBER,
      );
    }
  }

  /**
   * 降职或删除成员结果
   * @param returnData
   */
  private static onDemoteOrDeleteMemberResult(
    returnData: Gateway.Returned.Common.Result<{
      club_id: number;
      player_id: number;
      result_type: "demote" | "delete"; // 0降职 1踢人
    }>,
  ) {
    console.log(
      "<ClubEvent> onDemoteOrDeleteMemberResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;

    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "MemberListUI",
        MemberListUI_Component,
      );
      component &&
        component.onDemoteOrDeleteMemberResult(
          data.player_id,
          data.result_type,
        );
    } else {
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.DEMOTE_OR_DELETE_MEMBER);
  }

  /**
   * 获取合伙人列表
   * @param params
   */
  public static getPartnerList(
    params: Gateway.Requested.ClubPlayer.GetPartnerListParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.GET_PARTNER_LIST);
      socket.emit(CLUB_EVENT.GET_PARTNER_LIST, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_PARTNER_LIST);
    }
  }

  /**
   * 处理获取合伙人列表结果事件
   * @param returnData
   */
  private static onGetPartnerListResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.Pagenation<
        Gateway.Returned.ClubPlayer.ClubPlayer[]
      >
    >,
  ) {
    console.log("<ClubEvent> onGetPartnerListResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      //  打开合伙人列表界面
      const [node, component] =
        ComponentManager.Instance.renderUiNode<PartnerListUI_Component>(
          "PartnerListUI",
          "Prefabs",
          "Club/PartnerListUI",
          PartnerListUI_Component,
        );
      component && component.setData(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_PARTNER_LIST);
  }

  /**
   * 添加合伙人
   * @param params
   */
  public static addPartner(
    params: Gateway.Requested.ClubPlayer.AddPartnerParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.ADD_PARTNER);
      socket.emit(CLUB_EVENT.ADD_PARTNER, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.ADD_PARTNER);
    }
  }

  /**
   * 处理添加合伙人结果事件
   * @param returnData
   */
  private static onAddPartnerResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<ClubEvent> onAddPartnerResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      //  获取合伙人列表界面
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "PartnerListUI",
        PartnerListUI_Component,
      );
      component && component.reloadData();
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.ADD_PARTNER);
  }

  /**
   * 删除合伙人
   * @param params
   */
  public static deletePartner(
    params: Gateway.Requested.ClubPlayer.DeletePartnerParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.DELETE_PARTNER);
      socket.emit(CLUB_EVENT.DELETE_PARTNER, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.DELETE_PARTNER);
    }
  }

  /**
   * 处理删除合伙人结果事件
   * @param returnData
   */
  private static onDeletePartnerResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<ClubEvent> onDeletePartnerResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      //  获取合伙人列表界面
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "PartnerListUI",
        PartnerListUI_Component,
      );
      component && component.reloadData();
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.DELETE_PARTNER);
  }

  /**
   * 获取合伙人成员列表
   * @param params
   */
  public static getPartnerMemberList(
    params: Gateway.Requested.ClubPlayer.GetPartnerMemberListParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.GET_PARTNER_MEMBER_LIST,
      );
      socket.emit(CLUB_EVENT.GET_PARTNER_MEMBER_LIST, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.GET_PARTNER_MEMBER_LIST,
      );
    }
  }

  /**
   * 处理获取合伙人成员列表结果事件
   * @param returnData
   */
  public static onGetPartnerMemberListResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.Pagenation<
        Gateway.Returned.ClubPlayer.ClubPlayer[]
      >
    >,
  ) {
    console.log(
      "<ClubEvent> onGetPartnerMemberListResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 获取合伙人列表界面
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "PartnerMemberListUI",
        PartnerMemberListUI_Component,
      );
      component && component.setData(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_PARTNER_MEMBER_LIST);
  }

  /**
   * 添加合伙人成员
   * @param params
   */
  public static addPartnerMember(
    params: Gateway.Requested.ClubPlayer.AddPartnerMemberParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.ADD_PARTNER_MEMBER);
      socket.emit(CLUB_EVENT.ADD_PARTNER_MEMBER, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.ADD_PARTNER_MEMBER);
    }
  }

  /**
   * 处理添加合伙人成员结果事件
   * @param returnData
   */
  private static onAddPartnerMemberResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log("<ClubEvent> onAddPartnerMemberResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      //  获取合伙人列表界面
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "PartnerMemberListUI",
        PartnerMemberListUI_Component,
      );
      component && component.reloadData();
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.ADD_PARTNER_MEMBER);
  }

  /**
   * 删除合伙人成员
   * @param params
   */
  public static deletePartnerMember(
    params: Gateway.Requested.ClubPlayer.DeletePartnerMemberParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.DELETE_PARTNER_MEMBER);
      socket.emit(CLUB_EVENT.DELETE_PARTNER_MEMBER, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.DELETE_PARTNER_MEMBER);
    }
  }

  /**
   * 处理删除合伙人成员结果事件
   * @param returnData
   */
  private static onDeletePartnerMemberResult(
    returnData: Gateway.Returned.Common.Result<boolean>,
  ) {
    console.log(
      "<ClubEvent> onDeletePartnerMemberResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 获取合伙人成员列表界面
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "PartnerMemberListUI",
        PartnerMemberListUI_Component,
      );
      component && component.reloadData();
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.DELETE_PARTNER_MEMBER);
  }

  /**
   * 获取俱乐部玩家上下分日志列表
   * @param params
   */
  public static getClubPlayerScoreLogList(
    params: Gateway.Requested.ClubPlayer.GetClubPlayerScoreLogListParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.GET_CLUB_PLAYER_SCORE_LOG_LIST,
      );
      socket.emit(CLUB_EVENT.GET_CLUB_PLAYER_SCORE_LOG_LIST, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.GET_CLUB_PLAYER_SCORE_LOG_LIST,
      );
    }
  }

  /**
   * 处理获取俱乐部玩家上下分日志列表结果事件
   * @param returnData
   */
  private static onGetClubPlayerScoreLogListResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.Pagenation<
        Gateway.Returned.ClubPlayer.ClubPlayerScoreLog[]
      >
    >,
  ) {
    console.log(
      "<ClubEvent> onGetClubPlayerScoreLogListResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 打开俱乐部玩家上下分日志列表界面
      const [node, component] =
        ComponentManager.Instance.renderUiNode<MemberScoreLogListUI_Component>(
          "MemberScoreLogListUI",
          "Prefabs",
          "Club/MemberScoreLogListUI",
          MemberScoreLogListUI_Component,
        );
      component && component.setData(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(
      WAITING_TYPE.GET_CLUB_PLAYER_SCORE_LOG_LIST,
    );
  }

  /**
   * 获取俱乐部玩家积分排名列表
   * @param params
   */
  public static getClubPlayerScoreRankList(
    params: Gateway.Requested.ClubPlayer.GetClubPlayerScoreRankListParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.GET_CLUB_PLAYER_SCORE_RANK_LIST,
      );
      socket.emit(CLUB_EVENT.GET_CLUB_PLAYER_SCORE_RANK_LIST, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.GET_CLUB_PLAYER_SCORE_RANK_LIST,
      );
    }
  }

  /**
   * 处理获取俱乐部玩家积分排名列表结果事件
   * @param returnData
   */
  private static onGetClubPlayerScoreRankListResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.Pagenation<
        Gateway.Returned.ClubPlayer.ClubPlayerScoreRank[]
      >
    >,
  ) {
    console.log(
      "<ClubEvent> onGetClubPlayerScoreRankListResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 打开俱乐部玩家积分排名列表界面
      const [node, component] =
        ComponentManager.Instance.renderUiNode<MemberScoreRankListUI_Component>(
          "MemberScoreRankListUI",
          "Prefabs",
          "Club/MemberScoreRankListUI",
          MemberScoreRankListUI_Component,
        );
      component && component.setData(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(
      WAITING_TYPE.GET_CLUB_PLAYER_SCORE_RANK_LIST,
    );
  }

  /**
   * 获取我的成员列表
   * @param params
   */
  public static getMyMemberList(
    params: Gateway.Requested.ClubPlayer.GetMyMemberListParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.GET_MY_MEMBER_LIST);
      socket.emit(CLUB_EVENT.GET_MY_MEMBER_LIST, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_MY_MEMBER_LIST);
    }
  }

  /**
   * 处理获取我的成员列表结果事件
   * @param returnData
   */
  private static onGetMyMemberListResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.Pagenation<
        Gateway.Returned.ClubPlayer.ClubPlayer[]
      >
    >,
  ) {
    console.log("<ClubEvent> onGetMyMemberListResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 打开我的成员列表界面
      const [node, component] =
        ComponentManager.Instance.renderUiNode<MyMemberListUI_Component>(
          "MyMemberListUI",
          "Prefabs",
          "Club/MyMemberListUI",
          MyMemberListUI_Component,
        );
      component && component.setData(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_MY_MEMBER_LIST);
  }

  /**
   * 获取俱乐部游戏房间列表
   */
  public static getClubGameRoomList() {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.GET_CLUB_GAME_ROOM_LIST,
      );
      socket.emit(CLUB_EVENT.GET_CLUB_GAME_ROOM_LIST);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.GET_CLUB_GAME_ROOM_LIST,
      );
    }
  }

  /**
   *  处理获取俱乐部游戏房间列表结果事件
   * @param returnData
   */
  private static onGetClubGameRoomListResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Games.DicesGame.DicesGameRoomTableUiData[]
    >,
  ) {
    console.log(
      "<DicesGameEvent> onGetClubGameRoomListResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "ClubMainUI",
        ClubMainUI_Component,
      );
      component && component.renderClubGameTableList(data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.GET_CLUB_GAME_ROOM_LIST);
  }

  /**
   * 处理俱乐部游戏房间解散通知结果
   * @param returnData
   */
  private static onRoomDissolvedResult(
    returnData: Gateway.Returned.Common.Result<{
      data: Gateway.Returned.Games.DicesGame.DicesGameRoomTableUiData;
      type: GAME_TYPE;
    }>,
  ) {
    console.log("<ClubEvent> onRoomDissolvedResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "ClubMainUI",
        ClubMainUI_Component,
      );
      component && component.updateClubGameTableList(data.data, "DEL");
    }
  }

  /**
   * 处理俱乐部游戏房间创建通知结果
   * @param returnData
   */
  private static onRoomCreatedResult(
    returnData: Gateway.Returned.Common.Result<{
      data: Gateway.Returned.Games.DicesGame.DicesGameRoomTableUiData;
      type: GAME_TYPE;
    }>,
  ) {
    console.log("<ClubEvent> onRoomCreatedResult called --->", returnData);
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      const [node, component] = ComponentManager.Instance.getNodeComponent(
        "ClubMainUI",
        ClubMainUI_Component,
      );
      component && component.updateClubGameTableList(data.data, "ADD");
    }
  }

  /**
   * 获取我的俱乐部骰子游戏结算记录
   * @param params
   */
  public static getMyClubDicesGameSettlement(
    params: Gateway.Requested.ClubPlayer.GetMyClubDicesGameSettlementParams,
  ) {
    const socket = SocketManager.Instance.SocketInstance;
    if (socket) {
      CommonDailogHandler.showCircleLoading(
        WAITING_TYPE.GET_MY_CLUB_DICES_GAME_SETTLEMENT,
      );
      socket.emit(CLUB_EVENT.GET_MY_CLUB_DICES_GAME_SETTLEMENT, params);
    } else {
      CommonDailogHandler.showDialogMessage(`错误：Socket实例不存在!`);
      CommonDailogHandler.hideCircleLoading(
        WAITING_TYPE.GET_MY_CLUB_DICES_GAME_SETTLEMENT,
      );
    }
  }

  /**
   * 处理我的俱乐部骰子游戏结算记录结果事件
   * @param returnData
   */
  private static onGetMyClubDicesGameSettlementResult(
    returnData: Gateway.Returned.Common.Result<
      Gateway.Returned.Common.Pagenation<
        Gateway.Returned.ClubPlayer.ClubDicesGameSettlement[]
      >
    >,
  ) {
    console.log(
      "<DicesGameEvent> onGetMyClubDicesGameSettlementResult called --->",
      returnData,
    );
    const { code, data, msg } = returnData;
    if (code === RESPONE_RESULT.SUCCESS) {
      // 打开战绩界面
      const [node, component] =
        ComponentManager.Instance.renderUiNode<DicesGameRecordUI_Component>(
          "DicesGameRecordUI",
          "Prefabs",
          "Common/DicesGameRecordUI",
          DicesGameRecordUI_Component,
        );
      component && component.setShowMode("ClubOnly");
      component && component.setData(data.data);
    } else {
      // 连接失败，弹出提示框
      CommonDailogHandler.showBubbleMessage(`${msg}`);
    }
    CommonDailogHandler.hideCircleLoading(
      WAITING_TYPE.GET_MY_CLUB_DICES_GAME_SETTLEMENT,
    );
  }
}
