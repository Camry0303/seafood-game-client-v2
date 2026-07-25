/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2022 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/

#import "AppDelegate.h"
#import "ViewController.h"
#import "View.h"
#import "BatteryMonitor.h"
#import "LocationService.h"

#include "platform/ios/IOSPlatform.h"
#import "platform/ios/AppDelegateBridge.h"
#import "service/SDKWrapper.h"

#include "application/ApplicationManager.h"
#include "cocos/bindings/jswrapper/SeApi.h"


@implementation AppDelegate
@synthesize window;
@synthesize appDelegateBridge;

#pragma mark -
#pragma mark Application lifecycle

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [[SDKWrapper shared] application:application didFinishLaunchingWithOptions:launchOptions];
    appDelegateBridge = [[AppDelegateBridge alloc] init];
    
    //向微信注册
    [WXApi registerApp:@"wx8fec0cd047c3178b"
         universalLink:@"https://config.cj33.cn/"];
    
    // Add the view controller's view to the window and display.
    CGRect bounds = [[UIScreen mainScreen] bounds];
    self.window   = [[UIWindow alloc] initWithFrame:bounds];
    
    // Should create view controller first, cc::Application will use it.
    _viewController                           = [[ViewController alloc] init];
    _viewController.view                      = [[View alloc] initWithFrame:bounds];
    _viewController.view.contentScaleFactor   = UIScreen.mainScreen.scale;
    _viewController.view.multipleTouchEnabled = true;
    [self.window setRootViewController:_viewController];
    
    [self.window makeKeyAndVisible];
    [appDelegateBridge application:application didFinishLaunchingWithOptions:launchOptions];
    
    // 隐藏状态栏
    [[UIApplication sharedApplication] setStatusBarHidden:YES];
    // 限制屏幕熄屏
    [[UIApplication sharedApplication ] setIdleTimerDisabled:YES ];
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    /*
     Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
     Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
     */
    [[SDKWrapper shared] applicationWillResignActive:application];
    [appDelegateBridge applicationWillResignActive:application];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    /*
     Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
     */
    [[SDKWrapper shared] applicationDidBecomeActive:application];
    [appDelegateBridge applicationDidBecomeActive:application];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    /*
     Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
     If your application supports background execution, called instead of applicationWillTerminate: when the user quits.
     */
    [[SDKWrapper shared] applicationDidEnterBackground:application];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    /*
     Called as part of  transition from the background to the inactive state: here you can undo many of the changes made on entering the background.
     */
    [[SDKWrapper shared] applicationWillEnterForeground:application];
}

- (void)applicationWillTerminate:(UIApplication *)application {
    [[SDKWrapper shared] applicationWillTerminate:application];
    [appDelegateBridge applicationWillTerminate:application];
    // 关闭电池信息监听
    [[BatteryMonitor shared] stopMonitoring];
    // 关闭持续定位
    [[LocationService sharedInstance] stopLocationUpdate];
}

#pragma mark -
#pragma mark Memory management

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
    [[SDKWrapper shared] applicationDidReceiveMemoryWarning:application];
}

#pragma mark -
#pragma mark Sign Domain
NSString* signDomain = @"csw.sign.sumjay.com";

// 获取签名域名
+ (NSString*)getSignDomain{
    NSLog(@"getSignDomain Sign Domain is= %@",signDomain);
    return signDomain;
}

#pragma mark -
#pragma mark WeChat SDK
NSString* wxCode;

// 微信授权登陆
+ (void)wechatLogin{
    //构造SendAuthReq结构体
    SendAuthReq* req =[[[SendAuthReq alloc]init]autorelease];
    req.scope = @"snsapi_userinfo"; // 只能填 snsapi_userinfo
    req.state = @"123";
    //第三方向微信终端发送一个SendAuthReq消息结构
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
    NSLog(@"wechatLogin called!");
}

- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url {
    return  [WXApi handleOpenURL:url delegate:self];
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    return [WXApi handleOpenURL:url delegate:self];
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    return [WXApi handleOpenURL:url delegate:self];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void(^)(NSArray<id<UIUserActivityRestoring>> * __nullable restorableObjects))restorationHandler {
    return [WXApi handleOpenUniversalLink:userActivity delegate:self];
}

-(void) onResp:(BaseResp*)resp{
    if([resp isKindOfClass:[SendAuthResp class]])
    {
        SendAuthResp *aresp = (SendAuthResp *)resp;
        if (aresp.errCode== 0) {
            wxCode=aresp.code;
            NSLog(@"wxCode = %@",wxCode);
            NSString *callStr = [NSString stringWithFormat:@"NativeAPI.receiveAccessCode('%@')", wxCode];
            char callChars[128]; // 确保数组足够大以容纳字符串加上null终止符
            [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
            printf("%s\n",callChars);
            
            // 调用JSB返回wxCode "NativeAPI.receiveAccessCode('')"
            CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
                se::ScriptEngine::getInstance()->evalString(callChars);
            });
        } else {
            // 用户取消(-2) 或其他错误：主动通知 JS 关闭 loading，避免永转
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

#pragma mark -
#pragma mark Battery SDK

NSString* battery;
// 主动获取电池信息
+ (NSString*)getBatteryInfo{
    [UIDevice currentDevice].batteryMonitoringEnabled = YES; // 启用监控
    float level = [[UIDevice currentDevice] batteryLevel];  // 范围[0.0, 1.0]，-1表示未知
    int cocosBatteryStatus = -1;
    // 获取电池状态
    switch ([[UIDevice currentDevice] batteryState]) {
        case UIDeviceBatteryStateUnknown:
//            NSLog(@"电池状态未知");
            cocosBatteryStatus = 0;
            break;
        case UIDeviceBatteryStateUnplugged:
//            NSLog(@"使用电池中");
            cocosBatteryStatus = 1;
            break;
        case UIDeviceBatteryStateCharging:
//            NSLog(@"正在充电");
            cocosBatteryStatus = 2;
            break;
        case UIDeviceBatteryStateFull:
//            NSLog(@"已充满");
            cocosBatteryStatus = 3;
            break;
    }
    NSString *batteryInfo = [NSString stringWithFormat:@"%.2f,%d", level,cocosBatteryStatus];// 电量输出: xx.xx
//    NSLog(@"%@", batteryInfo);
    return batteryInfo;
}

// 开启电池信息监听
+ (void)startBatteryMonitoring{
    [[BatteryMonitor shared] startMonitoring];
    NSLog(@"打开电池信息监听");
}

// 关闭电池信息监听
+ (void)stopBatteryMonitoring{
    [[BatteryMonitor shared] stopMonitoring];
    NSLog(@"关闭电池信息监听");
}

#pragma mark -
#pragma mark Location Service
// 请求定位授权
+ (void)requestLocationPermission{
    [[LocationService sharedInstance] requestLocationAuthorization];
}

// 获取一次最后的定位信息
+ (NSString*)getLastLocation{
    NSString * locationInfo = [[LocationService sharedInstance] getLastLocation];
    NSLog(@"getLastLocation: %@", locationInfo);
    return locationInfo;
}

+ (void)openLocationSettings{
    [[LocationService sharedInstance] openLocationSettings];
}

@end
