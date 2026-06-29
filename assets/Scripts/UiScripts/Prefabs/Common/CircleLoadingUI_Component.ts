import { _decorator, Node, tween } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

export enum WAITING_TYPE {
  LOADING = "正在加载",
  SOCKET_RECONNECT = "正在重连Socket",
  WECHAT_AUTH = "正在等待微信登录授权",
  GET_LOCATION = "正在获取位置信息",
  SEND_CODE = "正在发送验证码",
  BINDING_PHONE = "正在绑定手机号",
  REGIST_PHONE = "正在注册账号",
  PHONE_AUTH = "正在手机号登录授权",
  RESET_PASSWORD = "正在重置密码",
  LOGIN = "正在登录服务器",

  GET_CURRENT_PLAYER = "正在获取当前玩家信息",
  CHANGE_NICKNAME = "正在修改昵称",
  CUSTOM_AVATAR = "正在设置头像",
  BINDING_AGENT = "正在绑定代理",

  GET_PLAYER_CLUB_LIST = "正在获取玩家俱乐部列表",
  CREATE_CLUB = "正在创建俱乐部",
  JOIN_CLUB_BY_ID = "正在加入俱乐部",
  QUIT_CLUB = "正在退出俱乐部",
  ENTER_CLUB = "正在进入俱乐部",
  LEAVE_CLUB = "正在离开俱乐部",
  QUERY_CLUB_PLAYER_UNREVIEWED_APPLICATION_LIST = "正在获取未审核的俱乐部玩家申请列表",
  REVIEW_CLUB_PLAYER_APPLICATION = "正在审核俱乐部玩家申请",

  INVITE_PLAYER_TO_CLUB = "正在邀请玩家加入俱乐部",

  CHANGE_CLUB_NAME = "正在修改俱乐部名称",
  CHANGE_CLUB_ANNOUNCEMENT = "正在修改俱乐部公告",
  SET_SUB_ADMIN = "正在设置副管",

  GET_MEMBER_MANAGEMENT_LIST = "正在获取成员管理列表",
  CHANGE_CLUB_PLAYER_SCORE = "正在处理俱乐部玩家积分",

  GET_MEMBER_LIST = "正在获取成员列表",
  DEMOTE_OR_DELETE_MEMBER = "正在处理成员",

  GET_PARTNER_LIST = "正在获取合伙人列表",
  ADD_PARTNER = "正在添加合伙人",
  DELETE_PARTNER = "正在删除合伙人",

  GET_PARTNER_MEMBER_LIST = "正在获取合伙人成员列表",
  ADD_PARTNER_MEMBER = "正在添加合伙人成员",
  DELETE_PARTNER_MEMBER = "正在删除合伙人成员",

  GET_CLUB_PLAYER_SCORE_LOG_LIST = "正在获取玩家上下分日志列表",
  GET_CLUB_PLAYER_SCORE_RANK_LIST = "正在获取玩家积分排行列表",

  GET_MY_MEMBER_LIST = "正在获取我的成员列表",

  GET_CLUB_GAME_ROOM_LIST = "正在获取俱乐部游戏房间列表",

  CREATE_ROOM = "正在创建房间",
  JOIN_ROOM = "正在加入房间",
  SPECTATE_ROOM = "正在进入观战房间",
  LEAVE_ROOM = "正在离开房间",
  DISSOLVE_ROOM = "正在解散房间",

  GET_GAME_STATUS = "正在获取游戏状态",
  SET_DEALER = "正在设置庄家",
  START_GAME = "正在开始游戏",
  CREATE_ORDER = "正在下注",

  GAME_RECONNECT = "正在重连游戏",
}

@ccclass("CircleLoadingUI_Component")
@menu("Hidden/CircleLoadingUI_Component")
export class CircleLoadingUI_Component extends ComponentController {
  /**
   * 圈圈节点
   */
  private _circleLoadingNode: Node = null;

  /**
   * 等待队列
   */
  private _waitings: Set<WAITING_TYPE> = new Set<WAITING_TYPE>();

  /**
   * 旋转动画实例
   */
  private _rotateTween: any = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();
    this._circleLoadingNode = this.getNode("Loading");
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));
  }

  protected onDestroy(): void {
    super.onDestroy();
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));

    // 清理旋转动画
    if (this._rotateTween) {
      this._rotateTween.stop();
      this._rotateTween = null;
    }
  }

  /**
   * 点击事件
   */
  private onTouchEnd() {
    if (this._waitings.size > 0) {
      // console.log(`onTouchEnd--->`, this._waitings);
      const [firstWaiting] = this._waitings;
      CommonDailogHandler.showBubbleMessage(firstWaiting);
    } else {
      this.node.active = false;
    }
  }

  /**
   * 显示
   * @param callback
   */
  public show(waiting: WAITING_TYPE, callback?: Function) {
    this.node.active = true;
    this._waitings.add(waiting as WAITING_TYPE);
    // console.log(`show-->`, this._waitings, waiting);

    // 如果是第一个等待任务，开始旋转动画
    if (this._waitings.size === 1) {
      this.startRotateAnimation();
    }

    if (callback) {
      callback();
    }
  }

  /**
   * 隐藏
   * @param callback
   */
  public hide(waiting: WAITING_TYPE, callback?: Function) {
    this._waitings.delete(waiting as WAITING_TYPE);
    // console.log(`hide-->`, this._waitings, waiting);

    if (this._waitings.size == 0) {
      this.stopRotateAnimation();
      this.node.active = false;
    }

    if (callback) {
      callback();
    }
  }

  /**
   * 开始旋转动画
   */
  private startRotateAnimation() {
    // 如果已有动画，先停止
    if (this._rotateTween) {
      this._rotateTween.stop();
    }

    // 创建并启动旋转动画
    this._rotateTween = tween(this._circleLoadingNode)
      .by(1, { angle: -360 }) // 1秒内旋转360度
      .union() // 合并动画，使旋转更流畅
      .repeatForever() // 无限循环
      .start();
  }

  /**
   * 停止旋转动画
   */
  private stopRotateAnimation() {
    if (this._rotateTween) {
      this._rotateTween.stop();
      this._rotateTween = null;
    }
  }
}
