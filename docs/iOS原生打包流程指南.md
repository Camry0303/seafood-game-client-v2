# iOS 原生打包流程指南（含问题、解决方案、注意事项）

> 项目：seafood-game-client-v2（虾兵蟹将）· Cocos Creator 3.8.6
> 整理日期：2026-07-29
> 关联文档：`build-troubleshooting.md`（历史打包问题）、`iOS企业签名热更新失败排查与修复.md`（热更专项）

---

## 一、打包完整步骤

### 1. 打包前检查

| 检查项 | 位置 | 说明 |
| --- | --- | --- |
| 热更 manifest 版本号 | `assets/version.manifest`、`assets/project.manifest` | 包内版本与服务器版本的关系决定是否触发热更；确认本次预期行为 |
| 热更地址 | 同上 | 当前为 `https://xbxj.hotupdate.cj33.cn`，两个 manifest 均为 https |
| 自定义原生代码在位 | `native/engine/ios/` | `HotUpdateSessionFix.mm`、`BatteryMonitor.mm`、`LocationService.mm`、`WechatSDK/` 等 |
| CMake 已包含自定义源文件 | `native/engine/ios/CMakeLists.txt` | `target_sources` 中含所有自定义 .mm（新增文件必须手动加，否则链接报 Undefined symbol） |
| Info.plist 关键项 | `native/engine/ios/Info.plist` | ATS、微信 URL Scheme、`CFBundleIcons`、`CFBundleDisplayName=虾兵蟹将` |

> **App 显示名（桌面图标下方名称）**：由 `native/engine/ios/Info.plist` 的 `CFBundleDisplayName` 控制，已改为字面量 `虾兵蟹将`。**`CFBundleName` 保持 `${PRODUCT_NAME}` 不动**（内部/进程名，参与签名与产物路径，填中文可能引发签名工具异常）。Android 同名在 `native/engine/android/res/values/strings.xml` 的 `app_name`。改名在 `native/engine/` 下，Creator 重新构建不覆盖。

### 2. Cocos Creator 构建

1. Creator → 构建发布 → iOS 平台 → 构建。
2. 产物在 `build/ios/`（assets、data、CMake 生成的 Xcode 工程）。
3. **构建不会覆盖 `native/engine/ios/` 下的自定义代码**——该目录是官方设计的用户代码区，可放心重复构建。

> 仅改了 `native/engine/ios/` 下的原生代码时，**不需要**回 Creator 重新构建：直接 Xcode 编译即可，工程内的 `ZERO_CHECK` 目标会检测 `CMakeLists.txt` 变化并自动重跑 CMake，把新文件纳入工程。

### 3. Xcode 编译 / Archive

1. 打开 `build/ios/proj/seafood-game-client-v2.xcodeproj`。
2. 选真机设备 → Build（⌘B）验证可编译、真机跑通。
3. Product → Archive → 导出 IPA（企业分发选 Enterprise / Ad Hoc 按需）。

### 4. 真机验证（开发签名阶段）

关键日志（Xcode 控制台）：

```
[HotUpdateSessionFix] swizzled backgroundSessionConfigurationWithIdentifier:
[HotUpdateSessionFix] intercept 'BackgroundDownloadIdentifier0' -> defaultSessionConfiguration
[HotUpdateSessionFix] intercept 'BackgroundDownloadIdentifier1' -> defaultSessionConfiguration
```

- `swizzled`：+load 方法交换成功（App 启动即出现）。
- 两条 `intercept`：热更的两个下载器（检查更新 + 热更下载）都已改走前台会话。
- 同时确认热更流程正常、能进游戏。

### 5. 企业签名与分发

1. IPA 交给企业签名平台重签。
2. 真机安装重签包，验证热更流程完整走通（不再报 code 1）。
3. 上传分发平台（蒲公英/fir 等）。

### 6. IPA 自检命令（可选）

```bash
cd /tmp && rm -rf sig && mkdir sig && cd sig && unzip -q "xxx.ipa"
# 图标（分发平台缩略图依赖）
ls Payload/*.app/AppIcon*.png
plutil -p Payload/*.app/Info.plist | grep -iA4 CFBundleIconFiles
# ATS（部分签名平台会清掉）
plutil -p Payload/*.app/Info.plist | grep -iA3 TransportSecurity
# 包内热更版本
grep -m1 '"version"' Payload/*.app/assets/project.manifest
```

---

## 二、本次核心问题：企业签名后热更新失败（code 1）

### 现象

- 开发签名/真机调试：热更正常。
- 企业签名后：请求 `version.manifest` 成功 → 请求 `project.manifest`（抓包有正确返回）→ 仍报 `code 1 = ERROR_DOWNLOAD_MANIFEST`。
- 版本号一致、HTTPS 通、ATS 正常——常规方向全部排除。

### 根因

Cocos 引擎 iOS 下载器（`DownloaderImpl-apple.mm`）**强制使用 NSURLSession 后台会话**（`backgroundSessionConfigurationWithIdentifier:`）。iOS 后台下载守护进程 `nsurlsessiond` 对后台任务严格鉴权：描述文件为**通配符**或 **Bundle ID 被重签修改**（企业签平台常见）时，后台任务被系统拒绝 → manifest 下载失败。

抓包"看似成功"是因为代理能看到 HTTP 响应，但系统层回调给 App 的是失败。

参考：Cocos 社区 `forum.cocos.org/t/topic/142817`（45楼）、`/t/topic/163441`。

### 解决方案（已采用：项目侧 Swizzle，不改引擎）

- 新增 `native/engine/ios/HotUpdateSessionFix.mm`：Method Swizzling 拦截
  `+[NSURLSessionConfiguration backgroundSessionConfigurationWithIdentifier:]`，
  仅当 identifier 以 `BackgroundDownloadIdentifier` 开头时返回
  `defaultSessionConfiguration`（前台会话），其它调用不受影响。
- `CMakeLists.txt` 的 `target_sources` 加入该文件。
- 已真机验证生效（见上文日志）。

**为什么不用其它方案：**

| 方案 | 结论 |
| --- | --- |
| 改 Creator 引擎 `DownloaderImpl-apple.mm` | 可行但是全局修改、Creator 升级/重装丢失，影响本机其它项目 |
| 改 `build/` 产物 | 不可行：build 内无引擎源码副本，`cfg.cmake` 的 `COCOS_X_PATH` 指向 Creator 安装目录，每次构建重新编译 |
| 项目侧 Swizzle（已采用） | 只改仓库内代码、随 git 管理、升级 Creator 不丢、效果等价 |

**代价与评估**：热更下载失去"退到后台继续下载"能力。本项目切后台即暂停游戏，热更全程在前台，**无实际影响**；切后台下载挂起、切回前台可恢复，与游戏行为一致。

---

## 三、注意事项汇总

### 打包相关

1. **`native/engine/ios/` 新增任何 .mm/.cpp 必须手动加进 `CMakeLists.txt` 的 `target_sources`**，Cocos 不会自动收集，否则链接报 `Undefined symbol`。
2. **不要用 Xcode 的 Clean Build Folder**（会报 boost/container 删除失败）。需要干净构建时删 DerivedData：
   `rm -rf ~/Library/Developer/Xcode/DerivedData/seafood-game-client-v2-*`
3. Creator 重新构建会把 `assets/` 当前的两个 manifest 重新打进包，**注意包内版本与服务器版本的关系**，避免意外触发/跳过热更影响测试结论。
4. 工程链接标记含 `-ObjC -all_load`（微信 SDK 要求），这同时保证了 Swizzle category 的 `+load` 必定执行。

### 企业签名相关

5. 企业签平台通常会**改 Bundle ID 或用通配符描述文件**，这正是热更失败的根源；本修复已绕开，但若签名平台还**清除 ATS**（`NSAllowsArbitraryLoads`），http 请求会受影响——当前全 https，无此风险，如改回 http 需用上文自检命令确认签名包的 ATS。
6. 重签不会改动二进制逻辑，Swizzle 修复在重签包中依然生效。

### 待修复的已知 Bug（影响热更验证结论）

7. `assets/Scripts/Utils/HotUpdateTools.ts:212`：
   ```ts
   // 错误：往 Array.prototype 上 unshift，searchPaths 实际未插入
   Array.prototype.unshift(searchPaths, newPaths);
   // 应为：
   searchPaths.unshift(...newPaths);
   ```
   影响：热更下载成功后重启仍加载旧资源，容易误判为"热更没生效"。**验证热更内容是否生效前应先修复。**
8. `HotUpdateUI_Component.ts:116` 界面版本号是 `onLoad` 硬编码占位（`1.0.0/1.0.0`），不是真实比较结果；排查版本问题以设备日志 `客户端版本: X, 当前最新版本: Y`（`HotUpdateTools.ts:50`）为准。

---

## 四、快速核对清单（每次出包）

- [ ] `native/engine/ios/CMakeLists.txt` 包含全部自定义 .mm
- [ ] Creator 构建（或仅原生改动时直接 Xcode 编译）
- [ ] 真机日志出现 `[HotUpdateSessionFix] swizzled ...`
- [ ] 热更流程真机走通（开发签名）
- [ ] Archive → 导出 IPA → 企业签名
- [ ] 重签包真机验证热更（不报 code 1）
- [ ] （如验证热更内容）先修 `HotUpdateTools.ts:212` unshift bug
