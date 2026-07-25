/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2022 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You
shall not use Cocos Creator software for developing other software or tools
that's used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to
you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/

#pragma once

#import "platform/ios/AppDelegateBridge.h"
#import <UIKit/UIKit.h>
#import "WechatSDK/WXApi.h"

@class ViewController;

@interface AppDelegate : NSObject <UIApplicationDelegate,WXApiDelegate> {
}

@property(nonatomic, readonly) ViewController *viewController;
@property(nonatomic, readonly) AppDelegateBridge *appDelegateBridge;

+(NSString*)getSignDomain; //获取签名域名

+(void)wechatLogin; // 微信登陆验证

+(NSString*)getBatteryInfo; // 主动获取电池信息
+(void)startBatteryMonitoring; // 开始监听电池信息
+(void)stopBatteryMonitoring; //停止监听电池信息

+(void)requestLocationPermission; // 请求定位授权
+(NSString*)getLastLocation; // 获取一次最后的定位信息
+(void)openLocationSettings;

@end
