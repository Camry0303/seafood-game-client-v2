# 微信登录 appSecret 客户端明文改造方案

> 状态：⏸ 暂不修复（2026-07-25 决策）。本文档仅记录改造方案，当前客户端代码未改动。
> 关联任务：微信对接复检 #2（高/安全）。

---

## 1. 当前问题

`assets/Scripts/Utils/WeChatLoginService.ts` 中存在：

```ts
private static appSecret = "ee322f7379d3d09b6e7c34c0b5b26e87";   // 明文写在客户端
```

并在 `getAccessToken(code)` 中直接用它向微信换取 `access_token`：

```
GET https://api.weixin.qq.com/sns/oauth2/access_token?appid=...&secret=<appSecret>&code=...&grant_type=authorization_code
```

即：**客户端持有 appSecret，并直连微信开放接口换 token**。

## 2. 风险

- **逆向泄露**：APK 经反编译/抓包即可提取 `appSecret`，属于高敏感凭据。
- **接口被盗用**：拿到 appSecret 后可冒充应用调用微信接口、刷量。
- **封号风险**：微信开放平台对 appSecret 泄露敏感，严重时可封禁应用。
- 当前 `wechatAuthorize` 接口只用了 `openid/nickname/avatar`，说明服务端本就具备登录能力，正好可把"换 token"这一步挪到后端。

## 3. 目标架构（推荐）

```
客户端                      后端                        微信开放平台
  │  —— 1. login code ——▶   │
  │                          │  —— 2. code + appSecret ——▶  │
  │                          │  ◀—— 3. access_token/openid ——  │
  │                          │  —— 4. (可选) 拉取用户信息 ——▶  │
  │  ◀—— 5. 自家 token + user ——  │
```

- 客户端：**只拿到微信登录的 `code`**，全程不接触 `appSecret`。
- 后端：安全保存 `appSecret`，负责用 `code` 换 `access_token`/`openid`，并据此完成自家账号登录，向客户端返回登录态（自家 `token` + 用户信息）。

## 4. 客户端改动点

1. **删除** `WeChatLoginService.ts:49` 的 `appSecret` 常量。
2. 改造 `doWechatLogin(accessCode)`：不再调用 `getAccessToken` / `getWeChatUser`（这两条直连微信的逻辑移除），改为把 `accessCode` 发给新后端接口。
3. 新增/改造一个请求方法，例如：
   ```ts
   const authResponse = await HttpApiServices.wechatLoginByCode(accessCode);
   // 后端返回 { token, openid, nickname, avatar, ... }
   ```
4. `wechatAuthorize(data)` 调整为消费后端返回结果（而非客户端自己拼密码逻辑），或交由后端统一签发 token。
5. 错误处理、`CircleLoading` 显隐逻辑保持不变（已在 #3/#4 加固）。

## 5. 后端接口约定（需与后端协同定义）

建议新增：

```
POST /api/wechat/login
Body: { "code": "<微信登录code>" }
Response: {
  "code": 0,
  "data": {
    "token": "<自家登录token>",
    "openid": "...",
    "nickname": "...",
    "avatar": "...",
    "unionid": "..."
  }
}
```

后端职责：
- 用 `appSecret` + `code` 调微信 `sns/oauth2/access_token` 换 `access_token`/`openid`；
- （可选）调 `sns/userinfo` 拉取昵称/头像；
- 完成自家账号注册/登录，签发 `token` 返回客户端。

> 注：微信 `code` 有效期约 5 分钟且一次性，必须由后端实时换取，不能缓存。

## 6. 迁移步骤

1. 后端新增 `/api/wechat/login`（用 code 换 token）。
2. 客户端 `WeChatLoginService` 改为只传 `code`，调用新接口。
3. 联调：安卓/iOS 真机走通登录。
4. 确认无误后，从客户端代码彻底移除 `appSecret` 常量（防残留）。
5. 视情况在微信开放平台**重置 appSecret**（若怀疑已泄露），并更新后端配置。

## 7. 验证与回滚

- 验证：真机微信登录成功、用户信息正确、自家 `token` 正常下发。
- 回滚：保留旧 `getAccessToken`/`getWeChatUser` 逻辑至新接口稳定，开关切回旧链路即可。

## 8. 相关上下文（2026-07-25 复检）

已修复：
- #1 ProGuard 保留微信 SDK（release 混淆导致 onResp 不触发）—— 已修复。
- #3 `AppActivity.sendReq` 未判断返回值，微信未安装时 loading 永转 —— 已修复（加 `if(!sent) wechatAuthFailed(...)`）。
- #4 `WeChatLoginService.getWeChatUser` 返回类型判断隐患 + 重复判断 —— 已修复（统一 `typeof ... === 'string' ? JSON.parse : data`）。

遗留：
- #2 appSecret 明文 —— 本文档方案，暂不修复。
- `getAccessToken`（约 102–145 行）存在与 #4 相同的 `response.data.errcode` + `JSON.parse(response.data)` 类型隐患，尚未修，建议后续一并处理。
