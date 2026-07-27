# iOS 企业签名后热更新失败（code 1）排查与修复

> 记录日期：2026-07-27
> 适用环境：Cocos Creator 3.8.6（本机安装路径 `/Applications/Cocos/Creator/3.8.6/`）

## 1. 现象

- 签名前（Xcode 开发签名 / 真机调试）：热更新正常，请求 `version.manifest` 后正常进入游戏。
- **企业签名（重签）后**：抓包可见先请求 `version.manifest`（成功、返回数据正确），随后请求 `project.manifest`，然后报热更新错误 **`code 1 = ERROR_DOWNLOAD_MANIFEST`**。
- 服务器与包内 manifest 版本号均为 `1.0.0`，HTTPS 链路可通，抓包中 `project.manifest` 也有正确返回。

## 2. 排查过程（已排除的方向）

| 怀疑方向 | 结论 | 依据 |
| --- | --- | --- |
| ATS（`NSAllowsArbitraryLoads` 被签名工具清掉） | ❌ 排除 | 两个 manifest 均为 `https://`，且签名后 `version.manifest` 的 https 请求成功 |
| 版本号不一致触发更新后资源缺失 | ❌ 排除 | 包内 `project.manifest` 与服务器 `version.manifest` 版本均为 `1.0.0` |
| CDN 缓存返回旧 manifest | ❌ 排除 | 抓包确认设备拿到的数据正确 |
| 服务器 https 未配全 / 重定向 | ❌ 排除 | 抓包显示 `project.manifest` 有正确响应，但 Cocos 仍判下载失败 |

关键矛盾点：**代理抓包看到"下载成功"，但 Cocos 原生下载器判定"下载失败"** → 问题出在系统层的下载通道，而非网络本身。

## 3. 根因

Cocos 引擎在 iOS 上的下载器（`DownloaderImpl-apple.mm`）**强制使用 NSURLSession 后台会话**（`backgroundSessionConfigurationWithIdentifier:`，标识为 `BackgroundDownloadIdentifier`）。

iOS 的后台下载守护进程 **`nsurlsessiond`** 在接收后台下载任务时会对 App 做**严格鉴权**：

- 描述文件是**通配符（wildcard provisioning）**，或
- **Bundle ID 被重签改掉**（第三方企业签/超级签常见操作）

任一命中，后台下载任务会被系统直接拒绝 → manifest 下载失败 → `ERROR_DOWNLOAD_MANIFEST (code 1)`。

这完整解释了所有现象：

- 签名前正常：开发签名的 provisioning 与 Bundle ID 严格匹配，`nsurlsessiond` 鉴权通过；
- 企业重签后失败：签名平台换了 Bundle ID 或用通配符描述文件，后台任务被拒；
- 抓包"看似成功"：代理层能看到 HTTP 响应，但系统层的后台任务回调被拒，Cocos 收到的是失败。

### 参考资料

- Cocos 中文社区：[creator 3.8.3 iOS 企业签名之后，无法进行热更](https://forum.cocos.org/t/topic/163441)（多人印证：真机调试正常、企业/重签后必失败）
- Cocos 中文社区：[CocosCreator 3.6+ iOS 发布后企业签名后热更新下载 .manifest 失败](https://forum.cocos.org/t/topic/142817)（第 45 楼指出 `nsurlsessiond` 鉴权机制与修复方法）

## 4. 修复方案

### 4.0 项目侧 Swizzle（✅ 已采用，不改引擎）

> `build/` 目录中没有引擎源码副本（`build/ios/proj/cfg.cmake` 的 `COCOS_X_PATH` 直接指向 Creator 安装目录，每次构建从那里编译），因此无法通过改 build 产物解决。改为在项目自己的原生壳代码里做运行时拦截。

- 新增 `native/engine/ios/HotUpdateSessionFix.mm`：通过 Method Swizzling 拦截
  `+[NSURLSessionConfiguration backgroundSessionConfigurationWithIdentifier:]`，
  仅当 identifier 以 `BackgroundDownloadIdentifier` 开头（即 Cocos 热更下载器）时
  返回 `defaultSessionConfiguration`（前台会话），其它调用不受影响。
- `native/engine/ios/CMakeLists.txt` 的 `target_sources` 中加入该文件。
- 优点：不碰 Creator 引擎文件、随仓库 git 管理、Creator 升级不丢失；
  工程已有 `-ObjC -all_load` 链接标记，category 的 `+load` 必定执行。
- 验证：构建后真机日志应出现
  `[HotUpdateSessionFix] swizzled ...` 与热更时的 `[HotUpdateSessionFix] intercept ...`。

### 4.1 引擎侧修改（备选方案，改引擎一行）

文件（Creator 3.8.6 内置引擎）：

```
/Applications/Cocos/Creator/3.8.6/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/network/DownloaderImpl-apple.mm
```

问题代码（约 207 行起，iOS 强制走后台会话）：

```objc
#if CC_PLATFORM == CC_PLATFORM_IOS
    // create backgroundSession for iOS to support background download
    self.downloadSession = [self backgroundURLSession];
```

以及（约 236–245 行，`backgroundURLSession` 方法内）：

```objc
NSString* identifierStr = [NSString stringWithFormat:@"%s%d", "BackgroundDownloadIdentifier", sessionId];
NSURLSessionConfiguration *backgroudConfig = [NSURLSessionConfiguration backgroundSessionConfigurationWithIdentifier:identifierStr];
```

**修改（约 243 行）**——让会话退化为前台默认会话，绕过 `nsurlsessiond` 鉴权：

```objc
// 原：
NSURLSessionConfiguration *backgroudConfig = [NSURLSessionConfiguration backgroundSessionConfigurationWithIdentifier:identifierStr];
// 改为：
NSURLSessionConfiguration *backgroudConfig = [NSURLSessionConfiguration defaultSessionConfiguration];
```

**修改后必须重新构建 iOS 工程**（引擎代码需重新编译进 App）。

代价：失去"App 退到后台仍继续下载"的能力。热更新在前台进行，无实际影响。

### 4.2 注意事项

1. **直接改 Creator 安装目录内的引擎文件是全局的**：影响本机所有使用 3.8.6 的项目，且 Creator 升级/重装后修改会丢失。
   - 快速验证：可先直接改，验证有效性；
   - 持久方案：将引擎拷贝为**自定义引擎**（项目 → 配置原生引擎），只对本项目生效，可随仓库管理。
2. 修改的是传输层，不影响热更新业务逻辑本身。

## 5. 附带发现的项目 Bug（建议一并修复）

### 5.1 搜索路径未生效

`assets/Scripts/Utils/HotUpdateTools.ts:212`：

```ts
// 错误：往 Array.prototype 上 unshift，searchPaths 实际未插入新路径
Array.prototype.unshift(searchPaths, newPaths);
// 正确：
searchPaths.unshift(...newPaths);
```

影响：热更下载成功后重启仍可能加载旧资源（"更新成功但内容没变"）。

### 5.2 界面版本号是硬编码占位

`assets/Scripts/UiScripts/Prefabs/Entrance/HotUpdateUI_Component.ts:116`：

```ts
this.setVersion("本地版本号:1.0.0, 服务器版本号:1.0.0");
```

界面显示的版本号是 `onLoad` 时的占位值，不是真实比较结果。真实比较日志在 `HotUpdateTools.ts:50`（`客户端版本: X, 当前最新版本: Y`）。排查版本问题时应以设备日志为准。

## 6. 验证清单

- [ ] 修改 `DownloaderImpl-apple.mm` 并重新构建 iOS 工程
- [ ] 用企业签名重签新包
- [ ] 真机安装，确认热更新流程完整走通（`version.manifest` → `project.manifest` → 资源下载 → 重启生效）
- [ ] 修复 `HotUpdateTools.ts:212` 的 `unshift` bug，验证热更后加载的是新资源
