/**
 * 响应状态枚举
 */
export enum RESPONE_STATUS {
  /**
   * 请求成功，返回对应资源
   */
  OK = 200,
  /**
   * 资源已创建（常用于POST请求后返回新资源URL）‌
   */
  CREATED = 201,
  /**
   * 请求已接受但未完成处理（适用于异步任务）‌
   */
  ACCEPTED = 202,
  /**
   * 请求成功但无返回内容
   */
  NO_CONTENT = 204,
  /**
   * 请求语法错误（如参数格式错误）‌
   */
  BAD_REQUEST = 400,
  /**
   * 需身份验证（如未登录或令牌失效）‌
   */
  UNAUTHORIZED = 401,
  /**
   * 无权限访问资源
   */
  FORBIDDEN = 403,
  /**
   * 请求资源不存在‌
   */
  NOT_FOUND = 404,
  /**
   * 服务器内部错误
   */
  ERROR = 500,
  /**
   * 网关或代理服务器从上游收到无效响应‌
   */
  BAD_GATEWAY = 501,
  /**
   * 服务器暂时不可用（如维护或过载）‌
   */
  UNAVAILABLE = 503,
}

/**
 * 响应结果枚举
 */
export enum RESPONE_RESULT {
  /**
   * 成功
   */
  SUCCESS = 1,
  /**
   * 失败
   */
  FAIL = 0,
}

/**
 * 电池状态枚举
 */
export enum BATTERY_STATUS {
  ERROR = -1, // 未知错误
  UNKNOW = 0, // 未知状态
  DISCHARGING = 1, // 正在放电
  CHARGING = 2, // 正在充电
  FULL = 3, // 充满
}

/**
 * IOS定位状态枚举
 */
export enum IOS_LOCATION_STATUS {
  NOT_DETERMINED = "not_determined", // 用户尚未授权访问位置信息
  DENIED = "denied", // 用户明确拒绝访问位置信息
  RESTRICTED = "restricted", // 应用程序无法访问位置信息（例如，家长控制设置）
  LOCATING = "locating", // 正在定位
  UNKNOW = "unknow", // 未知状态
}

/**
 * 安卓定位状态枚举
 */
export enum ANDROID_LOCATION_STATUS {
  DENIED = "Permission denied or helper not initialized",
  UNAVAILABLE = "Location unavailable", // 定位服务不可用
}

/**
 * 俱乐部申请类型
 */
export enum CLUB_APPLICATION_TYPE {
  JOIN = 0, // 加入
  QUIT = 1, // 退出
}

/**
 * 加入俱乐部结果枚举
 */
export enum JOIN_CLUB_RESULT {
  APPLY_SUCCESS = "申请成功",
  JOIN_SUCCESS = "加入成功",
  JOIN_FAIL = "加入失败",
}

/**
 * 退出俱乐部结果枚举
 */
export enum QUIT_CLUB_RESULT {
  APPLY_SUCCESS = "申请成功",
  QUIT_SUCCESS = "退出成功",
  QUIT_FAIL = "退出失败",
}

/**
 * 俱乐部成员角色
 */
export enum CLUB_PLAYER_ROLE {
  /**
   * 管理员(群主)
   */
  ADMIN = 0, // 管理员(群主)
  /**
   * 副管理员
   */
  SUB_ADMIN = 1, // 副管理员
  /**
   * 合伙人
   */
  PARTNER = 2, // 合伙人
  /**
   * 普通成员
   */
  MEMBER = 3, // 普通成员
  /**
   * 普通成员
   */
  ROBOT = 4, // 机器人
}

/**
 * 游戏房间状态
 */
export enum GAME_ROOM_STATUS {
  /**等待开始 */
  WAITING = 0,
  /**游戏中 */
  PLAYING = 1,
  /**结算中 */
  SETTLEMENT = 2,
  /**已解散 */
  DISMISS = 3,
}

/**
 * 骰子游戏状态
 */
export enum DICES_GAMING_STATUS {
  NONE = 0,
  PREPARATION = 1,
  ORDERING = 2,
  OPEN = 3,
}

/**
 * 正在游戏类型枚举
 */
export enum IN_GAME_TYPE {
  NONE = "none", // 无
  CLUB_DICES_GAME = "club_dices_game",
  PUBLIC_DICES_GAME = "public_dices_game",
}

/**
 * 游戏类型枚举
 */
export enum GAME_TYPE {
  DICES_GAME = "dices_game",
}

/**
 * 骰子皮肤
 */
export enum DICE_SKIN {
  "虎狮骰" = 0,
}
