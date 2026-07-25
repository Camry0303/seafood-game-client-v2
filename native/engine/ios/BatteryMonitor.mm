//
//  BatteryMonitor.mm
//  sumjay-2d-game-project-mobile
//
//  Created by FrozenHuang on 2025/7/18.
//
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
    
    // 添加电池状态监听
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(batteryStateChanged:)
                                                 name:UIDeviceBatteryStateDidChangeNotification
                                               object:nil];
    
    // 添加电量变化监听
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(batteryLevelChanged:)
                                                 name:UIDeviceBatteryLevelDidChangeNotification
                                               object:nil];
    
    // 初始状态
    [self sendBatteryStatus];
}

- (void)stopMonitoring {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)batteryStateChanged:(NSNotification *)notification {
    [self sendBatteryStatus];
}

- (void)batteryLevelChanged:(NSNotification *)notification {
    [self sendBatteryStatus];
}

- (void)sendBatteryStatus {
    float level = [UIDevice currentDevice].batteryLevel;
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
    
    NSString *callStr = [NSString stringWithFormat:@"NativeAPI.receiveBatteryInfo('%.2f','%d')", level,cocosBatteryStatus];
    char callChars[256]; // 确保数组足够大以容纳字符串加上null终止符
    [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
    printf("%s\n",callChars);
    
    CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
        se::ScriptEngine::getInstance()->evalString(callChars);
    });
}

@end
