# iOS 原生功能接入与热更新修复 — 全过程复盘（含完整代码）

> 项目：seafood-game-client-v2（虾兵蟹将）· Cocos Creator 3.8.6
> 时间跨度：2026-07-27 ~ 2026-07-29
> 关联文档：`iOS企业签名热更新失败排查与修复.md`（根因专项）、`iOS原生打包流程指南.md`（流程指南）、`build-troubleshooting.md`（历史打包问题）

---

## 目录

- [零、原生架构概述](#零原生架构概述)
- [一、微信登录接入](#一微信登录接入)
- [二、电池功能接入](#二电池功能接入)
- [三、定位功能接入](#三定位功能接入)
- [四、App 显示名改为「虾兵蟹将」](#四app-显示名改为虾兵蟹将)
- [五、企业签热更新修复](#五企业签热更新修复)
  - [5.1 问题现象](#51-问题现象)
  - [5.2 排查过程（逐步）](#52-排查过程逐步)
  - [5.3 根因确认](#53-根因确认)
  - [5.4 方案选型](#54-方案选型)
  - [5.5 实施步骤与完整代码](#55-实施步骤与完整代码)
  - [5.6 编译与验证](#56-编译与验证)
- [六、统一注意事项与遗留问题](#六统一注意事项与遗留问题)
- [变更文件清单](#变更文件清单)

---

## 零、原生架构概述

所有自定义原生代码都放在 Cocos 官方预留的 **`native/engine/ios/`** 目录下，Creator 重新构建**不会覆盖**此目录，因此这些改动可随仓库 git 管理。

```
native/engine/ios/
├── AppDelegate.h / .mm        ← 原生入口，微信/电池/定位的 OC 方法都在这里暴露
├── BatteryMonitor.h / .mm     ← 电池监听（新增）
├── LocationService.h / .mm    ← 定位服务（新增）
├── HotUpdateSessionFix.mm     ← 热更新后台会话修复（新增）
├── WechatSDK/                 ← 微信 SDK 静态库 + 头文件
├── service/                   ← SDKWrapper 生命周期钩子
├── Info.plist                 ← URL Scheme / 权限声明
└── CMakeLists.txt             ← 编译与链接配置（手动 target_sources）
```

**JSB 调用模式**：TS 侧通过 `native.reflection.callStaticMethod("AppDelegate", "方法名")` 调用 OC 类方法；OC 回传结果给 TS 时，在 Cocos 线程中 `evalString("NativeAPI.xxx(...)")`，TS 侧同名静态方法接收。

> 关键约束：**`native/engine/ios/` 下新增的 `.mm` 必须手动加入 `CMakeLists.txt` 的 `target_sources`**，否则链接报 `Undefined symbol`。

---

## 一、微信登录接入

### 步骤 1：引入微信 SDK

将微信开放平台下载的 SDK 放入 `native/engine/ios/WechatSDK/`：

```
WechatSDK/
├── libWeChatSDK.a      ← 静态库
├── WechatAuthSDK.h
├── WXApi.h
├── WXApiObject.h
└── README.txt
```

### 步骤 2：CMake 接入 SDK 与系统库

`CMakeLists.txt` 中配置头文件搜索路径、链接静态库，以及微信依赖的系统框架：

```cmake
# ===== 微信 SDK 接入 =====
# 头文件路径：AppDelegate 用 #import "WechatSDK/WXApi.h"，需把 WechatSDK 的父目录加入搜索路径
target_include_directories(${EXECUTABLE_NAME} PRIVATE ${CMAKE_CURRENT_LIST_DIR})
# 微信静态库（与引擎一致使用 plain 签名，避免 keyword/plain 混用报错）
target_link_libraries(${EXECUTABLE_NAME} ${CMAKE_CURRENT_LIST_DIR}/WechatSDK/libWeChatSDK.a)

# 微信 SDK 依赖的系统库 / 框架
find_library(SYS_CONFIG_LIB SystemConfiguration)
find_library(CORE_TELEPHONY_LIB CoreTelephony)
find_library(SECURITY_LIB Security)
find_library(WEBKIT_LIB WebKit)
find_library(CFNETWORK_LIB CFNetwork)
find_library(CORELOCATION_LIB CoreLocation)
target_link_libraries(${EXECUTABLE_NAME}
    ${SYS_CONFIG_LIB}
    ${CORE_TELEPHONY_LIB}
    ${SECURITY_LIB}
    ${WEBKIT_LIB}
    ${CFNETWORK_LIB}
    ${CORELOCATION_LIB}
    sqlite3
    z)

# 微信要求 -ObjC -all_load；用 $(inherited) 保留引擎原有 flag，避免覆盖
set_target_properties(${EXECUTABLE_NAME} PROPERTIES
    XCODE_ATTRIBUTE_OTHER_LDFLAGS "$(inherited) -ObjC -all_load")
```

> `-ObjC -all_load` 不仅满足微信 SDK 要求，也**保证本仓库所有 category 的 `+load` 一定被链接执行**（热更新 Swizzle 依赖它）。

### 步骤 3：Info.plist 配置 URL Scheme 与 Universal Link 查询

`Info.plist` 末尾新增微信回调 scheme 和查询白名单：

```xml
<!-- 微信登录：URL Scheme，用于微信回调拉回 App -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>weixin</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>wx8fec0cd047c3178b</string>
        </array>
    </dict>
</array>
<!-- 允许查询微信是否安装，用于 canOpenURL 判断 -->
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>weixin</string>
    <string>weixinULAPI</string>
</array>
```

> 此外，微信登录依赖 **Universal Link**，需在微信开放平台后台配置（本项目为 `https://config.cj33.cn/`，见步骤 4 的 `registerApp`）。

### 步骤 4：AppDelegate 暴露微信方法（.h 声明）

`AppDelegate.h` 声明相关方法、遵守 `WXApiDelegate` 协议：

```objc
#import "platform/ios/AppDelegateBridge.h"
#import <UIKit/UIKit.h>
#import "WechatSDK/WXApi.h"

@interface AppDelegate : NSObject <UIApplicationDelegate,WXApiDelegate> {
}

+(NSString*)getSignDomain; //获取签名域名
+(void)wechatLogin; // 微信登陆验证

// ... 电池 / 定位声明见对应章节 ...

@end
```

### 步骤 5：AppDelegate 实现微信逻辑（.mm）

注册、拉起授权、回调解包（`AppDelegate.mm` 相关片段）：

```objc
#import "AppDelegate.h"
#import "WechatSDK/WXApi.h"

// didFinishLaunchingWithOptions 中向微信注册（wxAppId + Universal Link）
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // ...
    // 向微信注册
    [WXApi registerApp:@"wx8fec0cd047c3178b"
         universalLink:@"https://config.cj33.cn/"];
    // ...
}

// 微信授权登陆
+ (void)wechatLogin {
    SendAuthReq* req =[[[SendAuthReq alloc]init]autorelease];
    req.scope = @"snsapi_userinfo"; // 只能填 snsapi_userinfo
    req.state = @"123";
    [WXApi sendReq:req completion:^(BOOL success) {
        if (!success) {
            // 微信未安装或 Universal Link 配置错误时不会触发 onResp，需主动通知 JS 关闭 loading
            NSString *callStr = @"NativeAPI.notifyWxAuthFailed('微信拉起失败，请确认已安装微信且 Universal Link 配置正确')";
            char callChars[512];
            [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
            CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
                se::ScriptEngine::getInstance()->evalString(callChars);
            });
        }
    }];
}

// 三种 URL 回调入口都交给微信处理（兼容不同 iOS 版本）
- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url {
    return  [WXApi handleOpenURL:url delegate:self];
}
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    return [WXApi handleOpenURL:url delegate:self];
}
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    return [WXApi handleOpenURL:url delegate:self];
}
// Universal Link 回调
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void(^)(NSArray<id<UIUserActivityRestoring>> * __nullable restorableObjects))restorationHandler {
    return [WXApi handleOpenUniversalLink:userActivity delegate:self];
}

// 微信返回授权码 code
-(void) onResp:(BaseResp*)resp {
    if([resp isKindOfClass:[SendAuthResp class]]) {
        SendAuthResp *aresp = (SendAuthResp *)resp;
        if (aresp.errCode== 0) {
            wxCode=aresp.code;
            NSString *callStr = [NSString stringWithFormat:@"NativeAPI.receiveAccessCode('%@')", wxCode];
            char callChars[128];
            [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
            CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
                se::ScriptEngine::getInstance()->evalString(callChars);
            });
        } else {
            // 用户取消(-2) 或其它错误：主动通知 JS 关闭 loading，避免永转
            NSString *errMsg = [NSString stringWithFormat:@"微信授权失败，错误码：%ld", (long)aresp.errCode];
            NSString *callStr = [NSString stringWithFormat:@"NativeAPI.notifyWxAuthFailed('%@')", errMsg];
            char callChars[512];
            [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
            CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
                se::ScriptEngine::getInstance()->evalString(callChars);
            });
        }
    }
}
```

### 步骤 6：TS 侧桥接与登录流程

`assets/Scripts/Utils/NativeAPI.ts` 中调用原生方法并接收回传：

```ts
// 拉起微信登录（iOS）
public static WeChatLoginIOS() {
  // @ts-ignore
  native.reflection.callStaticMethod("AppDelegate", "wechatLogin");
}

// 原生回传的授权 code，转交登录服务
public static receiveAccessCode(accessCode: string) {
  WeChatLoginService.doWechatLogin(accessCode);
}

// 原生通知微信授权失败原因（关闭 loading / 提示）
public static notifyWxAuthFailed(msg: string) {
  CommonDailogHandler.showDialogMessage(msg);
  CommonDailogHandler.hideCircleLoading(WAITING_TYPE.WECHAT_AUTH);
}
```

`assets/Scripts/Utils/WeChatLoginService.ts` 用 code 换 token 并登录游戏（核心方法）：

```ts
private static appId = "wx8fec0cd047c3178b";
private static appSecret = "ee322f7379d3d09b6e7c34c0b5b26e87";

// 入口：根据平台拉起登录
public static Login() {
  CommonDailogHandler.showCircleLoading(WAITING_TYPE.WECHAT_AUTH);
  if (WeChatLoginService.isAndroid) NativeAPI.WeChatLoginAndroid();
  else if (WeChatLoginService.isIOS) NativeAPI.WeChatLoginIOS();
  else this.getWeChatUserTest();
}

// 用 code 换 access_token + openid
private static async getAccessToken(code: string) {
  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;
  const response = await fly.get(url);
  const data: WeChatAuthRes = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  if (data.errcode) { /* 失败提示 */ return [null, null]; }
  // 过期则刷新 token（expires_in >= 7200）
  // ...
  return [access_token, openid];
}

// 登录游戏网关
private static async wechatAuthorize(data: WechatUserInfo) {
  const password = CryptoUtils.desEncryptPassword(md5(data.openid).toString().slice(0, 8).toUpperCase());
  const params = { openId: data.openid, nickname: data.nickname, avatar: data.headimgurl, password, time: moment().unix(), sign: "" };
  const authResponse = await HttpApiServices.wechatAuthorize(params);
  if (authResponse.code === RESPONE_RESULT.SUCCESS) {
    ComponentManager.Instance.setDataToStorage("token", authResponse.data.token);
    SocketManager.Instance.connect();
    CommonDailogHandler.hideCircleLoading(WAITING_TYPE.WECHAT_AUTH);
  }
}
```

> 注：完整版还包含 `getWeChatUser`（拉用户信息）、`getWeChatUserTest`（非原生平台测试桩）等，详见仓库文件。

---

## 二、电池功能接入

### 步骤 1：新增 `BatteryMonitor.h`

```objc
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#include "application/ApplicationManager.h"

NS_ASSUME_NONNULL_BEGIN

@interface BatteryMonitor : NSObject

+ (instancetype)shared;
- (void)startMonitoring;
- (void)stopMonitoring;

@end

NS_ASSUME_NONNULL_END
```

### 步骤 2：新增 `BatteryMonitor.mm`

```objc
#import "BatteryMonitor.h"
#include "application/ApplicationManager.h"
#include "cocos/bindings/jswrapper/SeApi.h"

@implementation BatteryMonitor

+ (instancetype)shared {
    static BatteryMonitor *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });
    return instance;
}

- (void)startMonitoring {
    [UIDevice currentDevice].batteryMonitoringEnabled = YES;
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(batteryStateChanged:)
                                                 name:UIDeviceBatteryStateDidChangeNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(batteryLevelChanged:)
                                                 name:UIDeviceBatteryLevelDidChangeNotification
                                               object:nil];
    [self sendBatteryStatus];
}

- (void)stopMonitoring {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)batteryStateChanged:(NSNotification *)notification { [self sendBatteryStatus]; }
- (void)batteryLevelChanged:(NSNotification *)notification { [self sendBatteryStatus]; }

- (void)sendBatteryStatus {
    float level = [UIDevice currentDevice].batteryLevel;
    int cocosBatteryStatus = -1;
    switch ([[UIDevice currentDevice] batteryState]) {
        case UIDeviceBatteryStateUnknown:      cocosBatteryStatus = 0; break;
        case UIDeviceBatteryStateUnplugged:    cocosBatteryStatus = 1; break;
        case UIDeviceBatteryStateCharging:     cocosBatteryStatus = 2; break;
        case UIDeviceBatteryStateFull:         cocosBatteryStatus = 3; break;
    }
    NSString *callStr = [NSString stringWithFormat:@"NativeAPI.receiveBatteryInfo('%.2f','%d')", level, cocosBatteryStatus];
    char callChars[256];
    [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
    printf("%s\n",callChars);
    CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
        se::ScriptEngine::getInstance()->evalString(callChars);
    });
}

@end
```

### 步骤 3：AppDelegate 暴露电池方法（.h）

```objc
+(NSString*)getBatteryInfo; // 主动获取电池信息
+(void)startBatteryMonitoring; // 开始监听电池信息
+(void)stopBatteryMonitoring; // 停止监听电池信息
```

### 步骤 4：AppDelegate 实现电池逻辑（.mm）

```objc
// 主动获取电池信息
+ (NSString*)getBatteryInfo {
    [UIDevice currentDevice].batteryMonitoringEnabled = YES;
    float level = [[UIDevice currentDevice] batteryLevel]; // [0.0,1.0]，-1 未知
    int cocosBatteryStatus = -1;
    switch ([[UIDevice currentDevice] batteryState]) {
        case UIDeviceBatteryStateUnknown:      cocosBatteryStatus = 0; break;
        case UIDeviceBatteryStateUnplugged:    cocosBatteryStatus = 1; break;
        case UIDeviceBatteryStateCharging:     cocosBatteryStatus = 2; break;
        case UIDeviceBatteryStateFull:         cocosBatteryStatus = 3; break;
    }
    return [NSString stringWithFormat:@"%.2f,%d", level, cocosBatteryStatus];
}

+ (void)startBatteryMonitoring { [[BatteryMonitor shared] startMonitoring]; }
+ (void)stopBatteryMonitoring  { [[BatteryMonitor shared] stopMonitoring]; }
```

### 步骤 5：TS 侧桥接

`NativeAPI.ts` 中：

```ts
// 获取当前电量：返回 "电量百分比字符串,状态码" 由 "," 分割
public static getBatteryInfoIOS() {
  // @ts-ignore
  const batteryInfoString = native.reflection.callStaticMethod("AppDelegate", "getBatteryInfo");
  const a = batteryInfoString.split(",");
  return { batteryPct: Number(a[0]) * 100, batteryStatus: Number(a[1]) };
}

public static startBatteryMonitoringIOS() {
  // @ts-ignore
  native.reflection.callStaticMethod("AppDelegate", "startBatteryMonitoring");
}

public static stopBatteryMonitoringIOS() {
  // @ts-ignore
  native.reflection.callStaticMethod("AppDelegate", "stopBatteryMonitoring");
}

// 原生监听回调：NativeAPI.receiveBatteryInfo('电量','状态')
public static receiveBatteryInfo(batteryPct: string, batteryStatus: string) {
  const batteryInfo = { batteryPct: Number(batteryPct) * 100, batteryStatus: Number(batteryStatus) };
  CommonDailogHandler.showDialogMessage(`batteryPct:${batteryInfo.batteryPct},batteryStatus:${batteryInfo.batteryStatus}`);
}
```

### 步骤 6：加入编译

`CMakeLists.txt` 的 `target_sources` 中加入（见第四章 4.5 节完整 CMake，`BatteryMonitor.mm` 已在内）。

---

## 三、定位功能接入

### 步骤 1：新增 `LocationService.h`

```objc
#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#include "application/ApplicationManager.h"

extern NSString *const LocationAuthorizationStatusChangedNotification;
extern NSString *const LocationUpdatedNotification;
extern NSString *const LocationErrorOccurredNotification;

typedef NS_ENUM(NSInteger, LocationError) {
    LocationErrorNone = 0,
    LocationErrorPermissionDenied,
    LocationErrorServiceDisabled,
    LocationErrorTimeout,
    LocationErrorNetworkError,
    LocationErrorUnknownError
};

@interface LocationService : NSObject <CLLocationManagerDelegate>

+ (instancetype)sharedInstance;
+ (void)requestLocationAuthorization;
+ (void)requestSingleLocation;
+ (void)startContinuousLocation;
+ (void)stopLocationUpdates;
- (NSString*)getLastLocation;
- (BOOL)isLocationServiceEnabled;
+ (void)openLocationSettings;
- (void)openLocationSettings;

@end
```

### 步骤 2：新增 `LocationService.mm`

```objc
#import "LocationService.h"
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UIKit.h>
#include "application/ApplicationManager.h"
#include "cocos/bindings/jswrapper/SeApi.h"

typedef NS_ENUM(NSInteger, LocationMode) {
    LocationModeSingle,
    LocationModeContinuous
};

@interface LocationService () <CLLocationManagerDelegate>
@property (strong, nonatomic) CLLocationManager *locationManager;
@property (assign, nonatomic) BOOL isRequestingAuthorization;
@property (assign, nonatomic) BOOL isLocationUpdateStarted;
@property (assign, nonatomic) LocationMode currentMode;
@property (strong, nonatomic) CLLocation *lastLocation;
@end

@implementation LocationService

+ (instancetype)sharedInstance {
    static LocationService *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{ instance = [[self alloc] init]; });
    return instance;
}

- (instancetype)init {
    if (self = [super init]) {
        _locationManager = [[CLLocationManager alloc] init];
        _locationManager.delegate = self;
        _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        _locationManager.distanceFilter = 10.0; // 10 米更新一次
        _isRequestingAuthorization = NO;
        _isLocationUpdateStarted = NO;
        _currentMode = LocationModeSingle;
    }
    return self;
}

#pragma mark - Public
+ (void)requestLocationAuthorization { [[self sharedInstance] requestLocationAuthorization]; }
+ (void)requestSingleLocation { [self sharedInstance].currentMode = LocationModeSingle; [[self sharedInstance] startLocationUpdate]; }
+ (void)startContinuousLocation { [self sharedInstance].currentMode = LocationModeContinuous; [[self sharedInstance] startLocationUpdate]; }
+ (void)stopLocationUpdates { [[self sharedInstance] stopLocationUpdate]; }
+ (void)openLocationSettings { [[self sharedInstance] openLocationSettings]; }

#pragma mark - 授权请求
- (void)requestLocationAuthorization {
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    switch (status) {
        case kCLAuthorizationStatusNotDetermined:
            self.isRequestingAuthorization = YES;
            [self.locationManager requestWhenInUseAuthorization]; // 仅前台使用
            break;
        case kCLAuthorizationStatusRestricted:
        case kCLAuthorizationStatusDenied:
            [self reportAuthorizationStatus:status];
            break;
        default: break; // AuthorizedAlways / AuthorizedWhenInUse 已授权
    }
}

#pragma mark - 定位
- (void)startLocationUpdate {
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if (status == kCLAuthorizationStatusAuthorizedWhenInUse || status == kCLAuthorizationStatusAuthorizedAlways) {
        [self.locationManager startUpdatingLocation];
        self.isLocationUpdateStarted = YES;
    } else {
        [self reportLocationError:LocationErrorPermissionDenied];
    }
}

- (void)stopLocationUpdate {
    [self.locationManager stopUpdatingLocation];
    self.isLocationUpdateStarted = NO;
}

- (void)openLocationSettings {
    NSURL *settingsUrl = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
    if ([[UIApplication sharedApplication] canOpenURL:settingsUrl]) {
        [[UIApplication sharedApplication] openURL:settingsUrl options:@{} completionHandler:nil];
    }
}

#pragma mark - 获取最后定位
- (NSString*)getLastLocation {
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if (status != kCLAuthorizationStatusAuthorizedAlways && status != kCLAuthorizationStatusAuthorizedWhenInUse) {
        return @"{\"error\":\"denied\"}"; // 简化：未授权返回错误
    }
    if (self.isLocationUpdateStarted == NO) {
        self.currentMode = LocationModeSingle;
        [self startLocationUpdate];
    }
    if (self.lastLocation) {
        CLLocationCoordinate2D c = self.lastLocation.coordinate;
        return [NSString stringWithFormat:@"{\"latitude\":%f,\"longitude\":%f}", c.latitude, c.longitude];
    }
    return @"{\"error\":\"locating\"}";
}

#pragma mark - CLLocationManagerDelegate
- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    if (self.isRequestingAuthorization == YES && status != kCLAuthorizationStatusNotDetermined) {
        self.isRequestingAuthorization = NO;
        [self reportAuthorizationStatus:status];
    }
}

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations {
    CLLocation *location = [locations lastObject];
    self.lastLocation = location;
    CLLocationCoordinate2D c = location.coordinate;
    NSString *callStr = [NSString stringWithFormat:@"NativeAPI.onLocationChanged(%f, %f)", c.latitude, c.longitude];
    char callChars[256];
    [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
    printf("%s\n",callChars);
    CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
        se::ScriptEngine::getInstance()->evalString(callChars);
    });
    if (self.currentMode == LocationModeSingle) [self stopLocationUpdate]; // 单次定位后停止
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    LocationError code = LocationErrorUnknownError;
    if (error.code == kCLErrorDenied) code = LocationErrorPermissionDenied;
    else if (error.code == kCLErrorLocationUnknown) code = LocationErrorTimeout;
    else if (error.code == kCLErrorNetwork) code = LocationErrorNetworkError;
    [self reportLocationError:code];
    [self stopLocationUpdate];
}

#pragma mark - 回传 JS
- (void)reportAuthorizationStatus:(CLAuthorizationStatus)status {
    int statusCode;
    switch (status) {
        case kCLAuthorizationStatusNotDetermined: statusCode = 0; break;
        case kCLAuthorizationStatusRestricted:    statusCode = 1; break;
        case kCLAuthorizationStatusDenied:        statusCode = 2; break;
        case kCLAuthorizationStatusAuthorizedAlways:        statusCode = 3; break;
        case kCLAuthorizationStatusAuthorizedWhenInUse:      statusCode = 4; break;
        default: statusCode = -1; break;
    }
    NSString *isGranted = statusCode > 2 ? @"true" : @"false";
    NSString *callStr = [NSString stringWithFormat:@"NativeAPI.onLocationPermissionIsGranted('{\"isGranted\":%@,\"system\":\"IOS\"}')", isGranted];
    char callChars[256];
    [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
    CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
        se::ScriptEngine::getInstance()->evalString(callChars);
    });
}

- (void)reportLocationError:(LocationError)errorCode {
    NSString *jsCall = [NSString stringWithFormat:@"onLocationError(%d)", (int)errorCode];
    NSLog(@"回调JS: %@", jsCall);
}

@end
```

### 步骤 3：AppDelegate 暴露定位方法（.h）

```objc
+(void)requestLocationPermission; // 请求定位授权
+(NSString*)getLastLocation; // 获取一次最后的定位信息
+(void)openLocationSettings;
```

### 步骤 4：AppDelegate 实现定位逻辑（.mm）

```objc
+ (void)requestLocationPermission { [[LocationService sharedInstance] requestLocationAuthorization]; }

+ (NSString*)getLastLocation {
    NSString *locationInfo = [[LocationService sharedInstance] getLastLocation];
    NSLog(@"getLastLocation: %@", locationInfo);
    return locationInfo;
}

+ (void)openLocationSettings { [[LocationService sharedInstance] openLocationSettings]; }
```

**AppDelegate 生命周期收尾**（`applicationWillTerminate:` 中停止定位，避免后台持续定位）：

```objc
- (void)applicationWillTerminate:(UIApplication *)application {
    [[SDKWrapper shared] applicationWillTerminate:application];
    [appDelegateBridge applicationWillTerminate:application];
    [[BatteryMonitor shared] stopMonitoring];
    [[LocationService sharedInstance] stopLocationUpdate];
}
```

### 步骤 5：TS 侧桥接与定位流程

`NativeAPI.ts` 中：

```ts
public static requestLocationPermissionIOS() {
  // @ts-ignore
  native.reflection.callStaticMethod("AppDelegate", "requestLocationPermission");
}

// 原生回传授权结果
public static onLocationPermissionIsGranted(result: string) {
  const r = JSON.parse(result) as { isGranted: boolean; system: "IOS" | "ANDROID" };
  if (r.isGranted) {
    if (r.system === "IOS") NativeAPI.getLastLocationIOS();
  } else {
    GlobalData.Instance.stopGetLocationTimer();
    CommonDailogHandler.showDialogMsgCallback({ message: "游戏需要定位，请在[设置-隐私-定位服务]中允许本应用使用定位服务", confirmText: "去设置" },
      () => { if (r.system === "IOS") NativeAPI.openLocationSettingsIOS(); });
  }
}

public static getLastLocationIOS() {
  // @ts-ignore
  const locationString = native.reflection.callStaticMethod("AppDelegate", "getLastLocation");
  return JSON.parse(locationString) as { error: IOS_LOCATION_STATUS | undefined; latitude: number; longitude: number };
}

// 原生监听回调：NativeAPI.onLocationChanged(lat, lng)
public static onLocationChanged(latitude: number, longitude: number) {
  GlobalData.Instance.setLastKnownLocation({ latitude, longitude });
}

public static openLocationSettingsIOS() {
  // @ts-ignore
  native.reflection.callStaticMethod("AppDelegate", "openLocationSettings");
}
```

`assets/Scripts/Utils/LocationService.ts` 中封装业务调用（单次/过期判断、错误分支引导去设置），例如：

```ts
private static getLastLocationFromNative(): void {
  if (this.isIOS) {
    const location_iOS = NativeAPI.getLastLocationIOS();
    if (!location_iOS.error) return;
    switch (location_iOS.error) {
      case IOS_LOCATION_STATUS.NOT_DETERMINED: NativeAPI.requestLocationPermissionIOS(); break;
      case IOS_LOCATION_STATUS.DENIED: /* 引导去设置 */ break;
      // ... RESTRICTED / UNKNOW / LOCATING 分支
    }
  }
}
```

> 完整分支与 5 分钟缓存逻辑见 `assets/Scripts/Utils/LocationService.ts`。

### 步骤 6：加入编译

`CMakeLists.txt` 的 `target_sources` 中加入（见第四章 4.5 节完整 CMake，`LocationService.mm` 已在内）。

---

## 四、App 显示名改为「虾兵蟹将」

### 步骤 1：修改 Info.plist 的 `CFBundleDisplayName`

只改对外显示名，不动内部名。改动位于 `native/engine/ios/Info.plist`：

```xml
<key>CFBundleDisplayName</key>
<string>虾兵蟹将</string>
```

`CFBundleDisplayName` 决定**用户桌面上 App 图标下方显示的名称**。

### 步骤 2：保持 `CFBundleName` 为变量（关键）

`CFBundleName` 是**内部/进程名**，会参与签名、产物路径、崩溃日志等，刻意保留变量引用、不填中文：

```xml
<key>CFBundleName</key>
<string>${PRODUCT_NAME}</string>
```

若此键也填中文，部分签名工具或 Xcode 路径处理可能出问题，故当时只改 `CFBundleDisplayName`、保留 `CFBundleName=${PRODUCT_NAME}`。

### 步骤 3：Android 同名（双端一致）

Android 侧在 `native/engine/android/res/values/strings.xml` 同步修改 `app_name`：

```xml
<string name="app_name">虾兵蟹将</string>
```

### 验证与注意事项

- 改名在 `native/engine/ios/` 下，Creator 重新构建不覆盖，可 git 管理。
- 安装后桌面显示「虾兵蟹将」即生效。
- 当前为硬编码中文。若未来需多语言 App 名或 A/B 包，应改为 `CFBundleDisplayName` 引用本地化 `InfoPlist.strings`（目前非必需）。

---

## 五、企业签热更新修复

### 5.1 问题现象

- **签名前**（Xcode 开发签名/真机调试）：热更新正常。请求 `version.manifest` 后正常进入游戏。
- **企业签名后**：抓包显示——
  1. 请求 `version.manifest` → 成功，返回数据正确；
  2. 接着请求 `project.manifest` → 抓包也有正确返回；
  3. 但客户端仍报热更新错误 **`code 1 = ERROR_DOWNLOAD_MANIFEST`**。
- 服务器与包内 manifest 版本号均为 `1.0.0`，热更地址为 `https://xbxj.hotupdate.cj33.cn`。

### 5.2 排查过程（逐步）

**步骤 1：核对本地与服务器 manifest**

```bash
cat assets/version.manifest
curl -s "http://xbxj.hotupdate.cj33.cn/version.manifest"
curl -sI "https://xbxj.hotupdate.cj33.cn/version.manifest"
```

结果：本地与服务器 `version` 均为 `1.0.0`，两个 manifest URL 均为 `https://`。

**步骤 2：逐一排除常规方向**

| 怀疑方向 | 结论 | 依据 |
| --- | --- | --- |
| ATS 被签名工具清掉 | ❌ 排除 | 全部 https，且签名后 `version.manifest` 的 https 请求成功 |
| 版本不一致触发更新后资源缺失 | ❌ 排除 | 包内 `project.manifest` 与服务器版本均 `1.0.0` |
| CDN 缓存返回旧 manifest | ❌ 排除 | 抓包确认设备拿到的数据正确 |
| 服务器 https 未配全/重定向 | ❌ 排除 | 抓包显示 `project.manifest` 有正确响应 |

**关键矛盾点**：代理抓包看到"下载成功"，但 Cocos 原生下载器判定"下载失败"→ 问题在**系统层下载通道**，不在网络本身。

**步骤 3：查阅社区资料**

- [forum.cocos.org/t/topic/163441](https://forum.cocos.org/t/topic/163441)：多人印证真机调试正常、企业/重签后必失败。
- [forum.cocos.org/t/topic/142817](https://forum.cocos.org/t/topic/142817)（第 45 楼）：点出真正机制——`nsurlsessiond` 对后台下载任务的鉴权。

**步骤 4：定位引擎源码**

引擎下载器位于 Creator 安装目录（不在项目仓库）：

```
/Applications/Cocos/Creator/3.8.6/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/network/DownloaderImpl-apple.mm
```

问题代码（引擎原文，未改动）：

```objc
// 约 207-209 行：iOS 强制走后台会话
#if CC_PLATFORM == CC_PLATFORM_IOS
    self.downloadSession = [self backgroundURLSession];
```

```objc
// 约 236-246 行：后台会话的创建
- (NSURLSession *)backgroundURLSession {
    static int sessionId = 0;
    NSString* identifierStr = [NSString stringWithFormat:@"%s%d", "BackgroundDownloadIdentifier" , sessionId];
    NSURLSessionConfiguration *backgroudConfig = [NSURLSessionConfiguration backgroundSessionConfigurationWithIdentifier:identifierStr];  // ← 企业签后被 nsurlsessiond 拒绝
    sessionId++;
    return [NSURLSession sessionWithConfiguration:backgroudConfig delegate:self delegateQueue:[NSOperationQueue mainQueue]];
}
```

### 5.3 根因确认

Cocos 引擎在 iOS 上**强制使用 NSURLSession 后台会话**（`backgroundSessionConfigurationWithIdentifier:`，标识前缀 `BackgroundDownloadIdentifier`）下载热更文件。iOS 后台下载守护进程 **`nsurlsessiond`** 接收后台任务时**严格鉴权**：

- 描述文件是**通配符（wildcard provisioning）**；
- 或 **Bundle ID 被重签修改**（第三方企业签/超级签平台常见操作）。

后台任务被拒 → manifest 下载失败 → `ERROR_DOWNLOAD_MANIFEST (code 1)`。

**为什么抓包"看似成功"**：代理工作在 HTTP 层能看到响应，但系统层 `nsurlsessiond` 回调给 App 的是失败。**为什么签名前正常**：开发签名 provisioning 与 Bundle ID 严格匹配，鉴权通过。

### 5.4 方案选型

| 方案 | 做法 | 结论 |
| --- | --- | --- |
| A. 改 Creator 引擎源文件 | `DownloaderImpl-apple.mm:243` 改为 `defaultSessionConfiguration` | 可行，但影响本机所有 3.8.6 项目，升级/重装丢失 |
| B. 改 `build/` 产物 | — | **不可行**：build 内无引擎源码副本 |
| C. 自定义引擎 | 拷贝引擎挂到项目 | 可行但重，为一行改动引入整套引擎维护成本 |
| **D. 项目侧 Method Swizzling（✅ 已采用）** | 项目原生壳代码里运行时拦截 | 只改仓库内代码、git 可管理、升级不丢、效果等价 |

**代价评估**：失去"退到后台继续下载"能力。经确认，本项目**切后台即暂停游戏**，热更全程在前台，无实际影响。

### 5.5 实施步骤与完整代码

**步骤 1：新增 `native/engine/ios/HotUpdateSessionFix.mm`**

```objc
#import <Foundation/Foundation.h>
#import <objc/runtime.h>

@interface NSURLSessionConfiguration (HotUpdateSessionFix)
@end

@implementation NSURLSessionConfiguration (HotUpdateSessionFix)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class cls = [NSURLSessionConfiguration class];
        SEL origSel = @selector(backgroundSessionConfigurationWithIdentifier:);
        SEL swzSel = @selector(huf_backgroundSessionConfigurationWithIdentifier:);
        Method origMethod = class_getClassMethod(cls, origSel);
        Method swzMethod = class_getClassMethod(cls, swzSel);
        if (origMethod && swzMethod) {
            method_exchangeImplementations(origMethod, swzMethod);
            NSLog(@"[HotUpdateSessionFix] swizzled backgroundSessionConfigurationWithIdentifier:");
        }
    });
}

+ (NSURLSessionConfiguration *)huf_backgroundSessionConfigurationWithIdentifier:(NSString *)identifier {
    if ([identifier hasPrefix:@"BackgroundDownloadIdentifier"]) {
        NSLog(@"[HotUpdateSessionFix] intercept '%@' -> defaultSessionConfiguration", identifier);
        return [NSURLSessionConfiguration defaultSessionConfiguration];
    }
    return [self huf_backgroundSessionConfigurationWithIdentifier:identifier]; // 已交换，即原实现
}

@end
```

设计要点：category `+load` 启动即执行；前缀白名单只拦截 `BackgroundDownloadIdentifier*`；交换后调用自身即原实现，非白名单调用不受影响。

**步骤 2：修改 `native/engine/ios/CMakeLists.txt`**

Cocos 默认只收集模板预置文件，新增 `.mm` 必须手动 `target_sources`。改动 diff：

```diff
 target_sources(${EXECUTABLE_NAME} PRIVATE
     ${CMAKE_CURRENT_LIST_DIR}/BatteryMonitor.mm
-    ${CMAKE_CURRENT_LIST_DIR}/LocationService.mm)
+    ${CMAKE_CURRENT_LIST_DIR}/LocationService.mm
+    ${CMAKE_CURRENT_LIST_DIR}/HotUpdateSessionFix.mm)
```

修改后 `CMakeLists.txt` 完整内容（当前版本）：

```cmake
cmake_minimum_required(VERSION 3.8)

set(CMAKE_SYSTEM_NAME iOS)
set(APP_NAME "seafood-game-client-v2"  CACHE STRING "Project Name")

project(${APP_NAME} CXX)

set(CC_PROJECT_DIR ${CMAKE_CURRENT_LIST_DIR})
set(CC_UI_RESOURCES)
set(CC_PROJ_SOURCES)
set(CC_ASSET_FILES)
set(CC_COMMON_SOURCES)
set(CC_ALL_SOURCES)

# 修正 RES_DIR：Cocos 可能传入相对项目根的路径(如 "build/ios")...
if(DEFINED RES_DIR AND NOT IS_ABSOLUTE(RES_DIR))
    get_filename_component(_res_dir_abs "${RES_DIR}" ABSOLUTE BASE_DIR "${CMAKE_BINARY_DIR}/../../..")
    set(RES_DIR "${_res_dir_abs}" CACHE STRING "Resource directory" FORCE)
endif()

include(${CC_PROJECT_DIR}/../common/CMakeLists.txt)
set(EXECUTABLE_NAME ${APP_NAME}-mobile)

cc_ios_before_target(${EXECUTABLE_NAME})
add_executable(${EXECUTABLE_NAME} ${CC_ALL_SOURCES})
cc_ios_after_target(${EXECUTABLE_NAME})

# 显式将自定义原生源文件加入编译
target_sources(${EXECUTABLE_NAME} PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}/BatteryMonitor.mm
    ${CMAKE_CURRENT_LIST_DIR}/LocationService.mm
    ${CMAKE_CURRENT_LIST_DIR}/HotUpdateSessionFix.mm)

# ===== 微信 SDK 接入 =====
target_include_directories(${EXECUTABLE_NAME} PRIVATE ${CMAKE_CURRENT_LIST_DIR})
target_link_libraries(${EXECUTABLE_NAME} ${CMAKE_CURRENT_LIST_DIR}/WechatSDK/libWeChatSDK.a)

find_library(SYS_CONFIG_LIB SystemConfiguration)
find_library(CORE_TELEPHONY_LIB CoreTelephony)
find_library(SECURITY_LIB Security)
find_library(WEBKIT_LIB WebKit)
find_library(CFNETWORK_LIB CFNetwork)
find_library(CORELOCATION_LIB CoreLocation)
target_link_libraries(${EXECUTABLE_NAME}
    ${SYS_CONFIG_LIB}
    ${CORE_TELEPHONY_LIB}
    ${SECURITY_LIB}
    ${WEBKIT_LIB}
    ${CFNETWORK_LIB}
    ${CORELOCATION_LIB}
    sqlite3
    z)

set_target_properties(${EXECUTABLE_NAME} PROPERTIES
    XCODE_ATTRIBUTE_OTHER_LDFLAGS "$(inherited) -ObjC -all_load")
```

> `RES_DIR` 修正、微信 SDK 接入、`-ObjC -all_load` 为历史已有改动；本次仅新增 `HotUpdateSessionFix.mm` 一行。但 `-ObjC -all_load` 对本修复有额外意义：保证 category 的 `+load` 一定执行。

**步骤 3：（备选，未采用）引擎侧一行改法**

```objc
// DownloaderImpl-apple.mm 第 243 行
// 原：
NSURLSessionConfiguration *backgroudConfig = [NSURLSessionConfiguration backgroundSessionConfigurationWithIdentifier:identifierStr];
// 改为：
NSURLSessionConfiguration *backgroudConfig = [NSURLSessionConfiguration defaultSessionConfiguration];
```

缺点：全局生效、Creator 升级丢失，故未采用。

### 5.6 编译与验证

- **仅改原生代码时无需回 Creator 重新构建**：直接打开 `build/ios/proj/seafood-game-client-v2.xcodeproj` 编译（⌘B）。`ZERO_CHECK` 检测 `CMakeLists.txt` 变化自动重跑 CMake，把新 `.mm` 纳入工程。
- 后续在 Creator 重新构建过：**不影响修复**——只重新生成 `build/ios/`，不会覆盖 `native/engine/ios/`。

**真机日志验证（已通过，2026-07-27）**：

```
[HotUpdateSessionFix] swizzled backgroundSessionConfigurationWithIdentifier:
[HotUpdateSessionFix] intercept 'BackgroundDownloadIdentifier0' -> defaultSessionConfiguration
[HotUpdateSessionFix] intercept 'BackgroundDownloadIdentifier1' -> defaultSessionConfiguration
```

- `swizzled`：方法交换在启动时成功；
- 两条 `intercept`：热更的两个下载器实例都已改走前台会话；
- 结论：热更下载完全绕开 `nsurlsessiond`，可送企业签测试。

**企业签验证流程**：Archive → 导出 IPA → 企业签名平台重签 → 真机安装验证热更不再报 code 1。重签不改二进制逻辑，Swizzle 依然生效。

---

## 六、统一注意事项与遗留问题

### 注意事项

1. `native/engine/ios/` 新增任何 `.mm`/`.cpp` **必须手动加入 `CMakeLists.txt` 的 `target_sources`**。
2. **不要用 Xcode Clean Build Folder**（boost/container 报错），需干净构建时：
   `rm -rf ~/Library/Developer/Xcode/DerivedData/seafood-game-client-v2-*`
3. Creator 重新构建会把 `assets/` 当前的 manifest 重新打包，注意**包内版本与服务器版本关系**，避免影响热更测试结论。
4. 若签名平台清除 ATS（`NSAllowsArbitraryLoads`），http 请求会受影响；当前全 https 无此风险。
5. 微信登录依赖 **Universal Link**（`https://config.cj33.cn/`）正确配置于微信开放平台与 `registerApp`，否则 `sendReq` 的 completion 走失败分支。
6. 微信 `appSecret` 当前明文写在 `WeChatLoginService.ts`，属安全隐患；正式分发建议改为服务端换 token（code→token 放到后端）。
7. 定位使用 `requestWhenInUseAuthorization`（仅前台），如需后台定位需改用 `Always` 并在 Info.plist 配 `NSLocationAlwaysAndWhenInUseUsageDescription`。
8. `-ObjC -all_load` 同时保证微信 SDK 与热更新 Swizzle 的 category 都被链接加载。

### 遗留问题（待修）

**① `assets/Scripts/Utils/HotUpdateTools.ts:212` — 搜索路径 bug**

```ts
// 错误：往 Array.prototype 上 unshift，searchPaths 实际未插入新路径
Array.prototype.unshift(searchPaths, newPaths);
// 应为：
searchPaths.unshift(...newPaths);
```

影响：热更下载成功后重启仍可能加载旧资源，验证热更内容生效前应先修复。

**② `HotUpdateUI_Component.ts:116` — 版本号硬编码占位**

```ts
this.setVersion("本地版本号:1.0.0, 服务器版本号:1.0.0");
```

界面显示的是 `onLoad` 占位值，非真实比较结果。真实比较日志见 `HotUpdateTools.ts`：
`客户端版本: X, 当前最新版本: Y`。

---

## 变更文件清单

| 文件 | 变更 | 说明 |
| --- | --- | --- |
| `native/engine/ios/HotUpdateSessionFix.mm` | 新增 | 热更新后台会话 Swizzle 修复（本次核心） |
| `native/engine/ios/BatteryMonitor.h / .mm` | 新增 | 电池监听 |
| `native/engine/ios/LocationService.h / .mm` | 新增 | 定位服务 |
| `native/engine/ios/AppDelegate.h / .mm` | 修改 | 暴露微信/电池/定位原生方法 |
| `native/engine/ios/Info.plist` | 修改 | 微信 URL Scheme / 查询白名单、`CFBundleDisplayName=虾兵蟹将` |
| `native/engine/ios/WechatSDK/` | 新增目录 | 微信 SDK 静态库与头文件 |
| `native/engine/ios/CMakeLists.txt` | 修改 | `target_sources` 加入新 `.mm` + 微信 SDK 链接 |
| `assets/Scripts/Utils/NativeAPI.ts` | 新增/修改 | JSB 桥接（微信/电池/定位） |
| `assets/Scripts/Utils/WeChatLoginService.ts` | 新增 | 微信登录流程 |
| `assets/Scripts/Utils/LocationService.ts` | 新增 | 定位业务封装 |
| `docs/iOS企业签热更新修复全过程复盘.md` | 新增 | 本文档（整合原生功能接入） |
| Creator 引擎文件 | **未改动** | 方案 A 仅记录备查 |
