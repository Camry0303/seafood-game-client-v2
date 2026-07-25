// LocationService.h
#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#include "application/ApplicationManager.h"

// 定义定位事件通知名称
extern NSString *const LocationAuthorizationStatusChangedNotification;
extern NSString *const LocationUpdatedNotification;
extern NSString *const LocationErrorOccurredNotification;

// 定位错误类型枚举
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

// 定位控制方法
+ (void)requestLocationAuthorization;
+ (void)requestSingleLocation;
+ (void)startContinuousLocation;
+ (void)stopLocationUpdates;

- (void)requestLocationAuthorization;
- (NSString*)getLastLocation;
- (void)startLocationUpdate;
- (void)stopLocationUpdate;

// 状态查询方法
//- (CLAuthorizationStatus)currentAuthorizationStatus;
//- (CLLocation *)lastKnownLocation;
- (BOOL)isLocationServiceEnabled;

// 系统设置
+ (void)openLocationSettings;
- (void)openLocationSettings;

@end
