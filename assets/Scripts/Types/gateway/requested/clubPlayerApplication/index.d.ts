/**
 * 获取当前俱乐部玩家申请列表参数
 */
export type QueryClubPlayerApplicationListParams = {
  club_id: number;
  review_status: number;
  type?: number;
  current: number;
  pageSize: number;
};

/**
 * 审核俱乐部玩家申请单参数
 */
export type ReviewClubPlayerApplicationParams = {
  application_id: number;
  review_status: number;
  application_type: number;
};
