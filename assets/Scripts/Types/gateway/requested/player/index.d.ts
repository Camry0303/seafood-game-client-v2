/**
 * 修改昵称参数
 */
export type ChangeNicknameParams = {
  nickname: string;
};

/**
 * 修改头像参数
 */
export type SetCustomAvatarParams = {
  avatar: string;
};

/**
 * 绑定代理参数
 */
export type BindAgentParams = {
  invite_code: number;
};
