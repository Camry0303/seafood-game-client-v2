# 打包问题排查记录（Android / iOS）

> 项目：seafood-game-client-v2（Cocos Creator 3.8.6，虾兵蟹将）
> 整理日期：2026-07-26

---

## 一、Android 打包问题

### 1. 构建报错：strings.xml 缺失（ENOENT）

- **现象**：Cocos 构建安卓时 `generateAppNameValues`（android.ts:427）读取 `native/engine/android/res/values/strings.xml` 报 `ENOENT`，构建失败。
- **根因**：自定义安卓工程的 `res/` 目录存在，但缺少 `res/values/strings.xml`。本工程是 CMake 自定义安卓结构（无 `app/src/main/`），res 位于 `native/engine/android/res/` 顶层，Cocos 模板本应提供的空 strings.xml 未随工程存在。
- **修复**：创建 `native/engine/android/res/values/strings.xml`：
  ```xml
  <resources><string name="app_name">虾兵蟹将</string></resources>
  ```
  Cocos 构建时可能覆盖/注入为 Creator 项目设置的游戏名。

### 2. Release 包微信登录无限加载（ProGuard 混淆）

- **现象**：release 包（`minifyEnabled true`）微信登录后 loading 永转，onResp 不触发。
- **根因**：`proguard-rules.pro` 未 keep 微信 SDK，`com.tencent.mm.opensdk.**` 被混淆，`WXEntryActivity.handleIntent` 失败。
- **修复**：proguard-rules.pro 增加：
  ```
  -keep class com.tencent.mm.opensdk.** { *; }
  -keep class com.cjtech.xiabing.wxapi.** { *; }
  ```

### 3. 打包/上架外部注意项

- 微信开放平台后台的**应用签名**（打包用 keystore 的 MD5，去冒号小写）必须与实际签名一致，包名 `com.cjtech.xiabing` 必须匹配，否则真机 `sendReq` 直接失败。
- `.gitignore` 不支持行内注释：`build/  # 注释` 会使规则失效，可能把上 GB 构建产物加入版本库。注释必须独占一行。

---

## 二、iOS 打包问题

### 1. IPA 在分发平台显示 Xcode 默认图标（桌面图标正常）

- **现象**：安装到手机后桌面图标与名称正常，但 IPA 上传到第三方分发平台（蒲公英/fir/企业分发页）或 Xcode Organizer 缩略图显示的是 Xcode 默认图标。
- **根因**：`AppIcon.appiconset/Contents.json` 使用新式 `"idiom":"universal"` 声明 → actool 只把图标编进 `Assets.car`，**不生成独立 PNG、不注入 CFBundleIconFiles**。分发平台解析 IPA 图标只读 `Info.plist` 的 `CFBundleIcons → CFBundlePrimaryIcon → CFBundleIconFiles` 并到 `.app` 根目录找 PNG，**不解析 Assets.car** → 找不到 → 显示默认图标。（手机系统能读 Assets.car，所以桌面一直正常。）
- **修复**（均在 `native/engine/ios/` 源码，重构建自动带入）：
  1. `Images.xcassets/AppIcon.appiconset/Contents.json` 改为**传统 idiom**（iphone 20/29/40/60 @2x@3x + ipad 20/29/40/76/83.5 @1x@2x + ios-marketing 1024）；
  2. `Info.plist` 显式声明 `CFBundleIcons` / `CFBundleIcons~ipad`（`CFBundleIconFiles=[AppIcon60x60]`、`CFBundleIconName=AppIcon`）双保险。
- **验证方法**（导出 IPA 后）：
  ```bash
  unzip -q xxx.ipa && ls Payload/*.app/AppIcon*.png
  plutil -p Payload/*.app/Info.plist | grep -iA4 CFBundleIconFiles
  ```
  能看到 `AppIcon60x60@2x.png` 且有 `CFBundleIconFiles` 即正常。

### 2. Xcode Clean Build Folder 失败（boost/container）

- **现象**：Clean 报 `Could not delete build/ios/proj/boost/container because it was not created by the build system`。
- **根因**：`boost/container` 是 CMake 生成的子工程（含 boost_container.xcodeproj 等），非 Xcode 创建，Xcode 拒绝删除。属 Cocos + CMake 生成工程的已知现象。
- **对策**：**不要用 Xcode Clean**。需要干净构建时：
  - 删 DerivedData：`rm -rf ~/Library/Developer/Xcode/DerivedData/seafood-game-client-v2-*`（等价且更彻底，可强制重编 asset catalog）；
  - 或删整个生成目录 `build/ios/proj/boost` 后让 Cocos 重新构建。

### 3. Cocos 构建 cmake failed（RES_DIR 相对路径）

- **现象**：Cocos 构建 iOS 报 cmake 配置失败，`COCOS_X_PATH` 未设置。
- **根因**：`common/CMakeLists.txt` 的 `include(${RES_DIR}/proj/cfg.cmake)` 中，Cocos 传入的 `RES_DIR` 为相对路径 `build/ios`，cmake `include()` 按源目录解析导致找不到 `cfg.cmake`。删 build 重来无效。
- **修复**：在 `ios/CMakeLists.txt` 的 `include(common)` 之前将 RES_DIR 转为绝对路径并 `set(... CACHE STRING ... FORCE)` 写回 cache（普通 set 无法覆盖同名 cache 变量）。

### 4. 链接报错 Undefined symbol（自增源文件未编译）

- **现象**：Xcode 链接报 `Undefined symbol: _OBJC_CLASS_$_BatteryMonitor` / `_LocationService`；新增 .mm/.h 不显示在 Xcode 导航栏。
- **根因**：Cocos 默认只收集模板预置源文件（AppDelegate/ViewController/main），用户新增的 `.mm` 不会自动加入编译列表。
- **修复**：在 `ios/CMakeLists.txt` 显式加入：
  ```cmake
  target_sources(${EXECUTABLE_NAME} PRIVATE
      ${CMAKE_CURRENT_LIST_DIR}/BatteryMonitor.mm
      ${CMAKE_CURRENT_LIST_DIR}/LocationService.mm)
  ```
- **经验**：今后在 `native/engine/ios` 新增任何用户 .mm/.cpp，都必须手动 `target_sources` 加入。

### 5. 第三方静态库（微信 SDK）未链接

- **现象**：`libWeChatSDK.a` 只被当 Resources 拷贝进 bundle，头文件不在 include 路径，编译/链接失败。
- **修复**（`ios/CMakeLists.txt`，在 `cc_ios_after_target` 之后）：
  - `target_include_directories` 加微信头文件路径；
  - `target_link_libraries` 链接 `libWeChatSDK.a` 及系统库（SystemConfiguration/CoreTelephony/Security/WebKit/CFNetwork/sqlite3/z/CoreLocation）；
  - `OTHER_LDFLAGS = "$(inherited) -ObjC -all_load"`（用 `$(inherited)` 避免覆盖引擎 flag）。
- **坑**：引擎 `apple.cmake` 用 plain 签名 `target_link_libraries`，自定义段不能用 `PRIVATE` 关键字（会报 all-keyword-or-all-plain）；CoreLocation 等 framework 在 plain 模式下需用 `find_library` 解析。

### 6. 其他打包相关配置

- App 显示名：`Info.plist` 的 `CFBundleDisplayName` 改为字面量 `虾兵蟹将`；`CFBundleName` 保持 `${PRODUCT_NAME}` 不动，避免影响签名/产物名。
- `Info.plist` 微信必配项：`CFBundleURLTypes`（weixin scheme = wx8fec0cd047c3178b）、`LSApplicationQueriesSchemes`（weixin/weixinULAPI）。
- Universal Links：entitlements 已配 `applinks:config.cj33.cn`，服务器需放 apple-app-site-association；微信后台需添加 iOS 平台（Bundle ID `com.cjtech.xiabing` + Universal Links）。
- 图标缓存：换图标后若桌面仍显示旧图标，删除旧 App + 重启手机（清 SpringBoard 缓存）+ 清 DerivedData 后重新 Archive。
