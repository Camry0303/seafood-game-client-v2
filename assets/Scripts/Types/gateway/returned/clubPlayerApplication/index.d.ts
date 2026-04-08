/**
 * 俱乐部玩家申请信息
 */
export type ClubPlayerApplication = {
  /**
   * 申请id
   */
  id: number;
  /**
   * 俱乐部id
   */
  club_id: number;
  /**
   * 申请类型 0:加入申请 1:退出申请
   */
  type: number;
  /**
   * 申请人id
   */
  applicant_id: number;
  /**
   * 申请人昵称
   */
  applicant_nickname: string;
  /**
   * 申请人头像
   */
  applicant_avatar: string;
  /**
   * 邀请人id
   */
  inviter_id: number;
  /**
   * 邀请人昵称
   */
  inviter_nickname: string;
  /**
   * 邀请人头像
   */
  inviter_avatar: string;
  /**
   * 审核人id
   */
  reviewer_id: number;
  /**
   * 审核人昵称
   */
  reviewer_nickname: string;
  /**
   * 审核人头像
   */
  reviewer_avatar: string;
  /**
   * 审核状态 0:待审核 1:通过 2:拒绝 3:已作废
   */
  review_status: number;
  /**
   * 原因
   */
  reason: string;
  /**
   * 申请时间
   */
  created_time: string;
  /**
   * 更新时间
   */
  updated_time: string;
};
