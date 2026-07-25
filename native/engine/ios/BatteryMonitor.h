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
