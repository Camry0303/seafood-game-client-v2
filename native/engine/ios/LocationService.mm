//
//  LocationService.mm
//  sumjay-2d-game-project-mobile
//
//  Created by FrozenHuang on 2025/7/20.
//
#include "cocos/bindings/jswrapper/SeApi.h"
#import "LocationService.h"
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UIKit.h>
#include "application/ApplicationManager.h"


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
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });
    return instance;
}

- (instancetype)init {
    if (self = [super init]) {
        _locationManager = [[CLLocationManager alloc] init];
        _locationManager.delegate = self;
        _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        _locationManager.distanceFilter = 10.0; // 10米更新一次
        _isRequestingAuthorization = NO;
        _isLocationUpdateStarted = NO;
        _currentMode = LocationModeSingle;
    }
    return self;
}

#pragma mark - Public Methods

+ (void)requestLocationAuthorization {
    [[self sharedInstance] requestLocationAuthorization];
}

+ (void)requestSingleLocation {
    [self sharedInstance].currentMode = LocationModeSingle;
    [[self sharedInstance] startLocationUpdate];
}

+ (void)startContinuousLocation {
    [self sharedInstance].currentMode = LocationModeContinuous;
    [[self sharedInstance] startLocationUpdate];
}

+ (void)stopLocationUpdates {
    [[self sharedInstance] stopLocationUpdate];
}

+ (void)openLocationSettings {
    [[self sharedInstance] openLocationSettings];
}

#pragma mark - Private Implementation

// 请求定位授权
- (void)requestLocationAuthorization {
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    NSLog(@"requestLocationAuthorization: %i", status);
    switch (status) {
        case kCLAuthorizationStatusNotDetermined:
            NSLog(@"kCLAuthorizationStatusNotDetermined");
            // 用户尚未做出选择（初始状态）
            self.isRequestingAuthorization = YES;
            [self.locationManager requestWhenInUseAuthorization];
            break;
        case kCLAuthorizationStatusRestricted:
            NSLog(@"kCLAuthorizationStatusRestricted");
            // 设备限制导致无法使用定位服务（如家长控制）
            [self reportAuthorizationStatus:status];
            break;
        case kCLAuthorizationStatusDenied:
            NSLog(@"kCLAuthorizationStatusDenied");
            // 用户明确拒绝授权或全局关闭定位服务
            [self reportAuthorizationStatus:status];
//            // 打开系统设置界面
//            [self openLocationSettings];
            break;
        case kCLAuthorizationStatusAuthorizedAlways:
            NSLog(@"kCLAuthorizationStatusAuthorizedAlways");
            // 用户授权应用在任何时间使用定位
//            [self reportAuthorizationStatus:status];
            break;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            NSLog(@"kCLAuthorizationStatusAuthorizedWhenInUse");
            // 用户授权应用在前台运行时使用定位
//            [self reportAuthorizationStatus:status];
            break;
        default:
            NSLog(@"default status");
            // 未知授权状态
            [self reportAuthorizationStatus:status];
            break;
    }
}
// 是否授权定位
- (BOOL) isLocationServiceEnabled{
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    switch (status) {
        case kCLAuthorizationStatusNotDetermined:
            NSLog(@"kCLAuthorizationStatusNotDetermined");
            // 用户尚未做出选择（初始状态）
            return NO;
        case kCLAuthorizationStatusRestricted:
            NSLog(@"kCLAuthorizationStatusRestricted");
            // 设备限制导致无法使用定位服务（如家长控制）
            return NO;
        case kCLAuthorizationStatusDenied:
            NSLog(@"kCLAuthorizationStatusDenied");
            // 用户明确拒绝授权或全局关闭定位服务
            return NO;
        case kCLAuthorizationStatusAuthorizedAlways:
            NSLog(@"kCLAuthorizationStatusAuthorizedAlways");
            return YES;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            NSLog(@"kCLAuthorizationStatusAuthorizedWhenInUse");
            return YES;
        default:
            NSLog(@"default status");
            // 未知授权状态
            return NO;
    }
}

// 获取最后定位
- (NSString*)getLastLocation{
    // 声明返回内容
    NSString *locationInfo = @"";
    
    // 判断是否已经授权定位
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if(status == kCLAuthorizationStatusNotDetermined){
        // 用户尚未做出选择
        locationInfo = @"{\"error\":\"not_determined\"}";
        return locationInfo;
    }
    else if (status == kCLAuthorizationStatusRestricted) {
        // 限制定位
        locationInfo = @"{\"error\":\"restricted\"}";
        return locationInfo;
    }
    else if (status == kCLAuthorizationStatusDenied) {
        // 拒绝定位
        locationInfo = @"{\"error\":\"denied\"}";
        return locationInfo;
    }
    else if (status != kCLAuthorizationStatusAuthorizedAlways && status != kCLAuthorizationStatusAuthorizedWhenInUse){
        // 其它状态
        locationInfo = @"{\"error\":\"unknow\"}";
        return locationInfo;
    }
    
    // 判断是否开启定位更新，如果没开启则开启
    if (self.isLocationUpdateStarted == NO) {
        self.currentMode = LocationModeSingle;
        [self startLocationUpdate];
    }
    
    // 判断是否有定位信息
    if(self.lastLocation){
        CLLocationCoordinate2D coordinate = self.lastLocation.coordinate;
        locationInfo = [NSString stringWithFormat:@"{\"latitude\":%f,\"longitude\":%f}", coordinate.latitude, coordinate.longitude];
    }
    else{
        locationInfo = @"{\"error\":\"locating\"}";
    }
    return locationInfo;
}

// 开始定位
- (void)startLocationUpdate {
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    
    if (status == kCLAuthorizationStatusAuthorizedWhenInUse ||
        status == kCLAuthorizationStatusAuthorizedAlways) {
        NSLog(@"有权限--->开始定位");
        [self.locationManager startUpdatingLocation];
        self.isLocationUpdateStarted = YES;
    } else {
        NSLog(@"无权限--->定位失败");
        [self reportLocationError:LocationErrorPermissionDenied];
    }
}

// 停止定位
- (void)stopLocationUpdate {
    [self.locationManager stopUpdatingLocation];
    self.isLocationUpdateStarted = NO;
}

// 打开系统设置界面
- (void)openLocationSettings {
    NSURL *settingsUrl = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
    if ([[UIApplication sharedApplication] canOpenURL:settingsUrl]) {
        [[UIApplication sharedApplication] openURL:settingsUrl options:@{} completionHandler:nil];
    }
}

#pragma mark - CLLocationManagerDelegate

// 授权状态变化回调函数
- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
//    NSLog(@"didChangeAuthorizationStatus Status: %i", status);
    if (self.isRequestingAuthorization == YES && status != kCLAuthorizationStatusNotDetermined) {
//        NSLog(@"is Requesting Location Authorization: Yes");
        self.isRequestingAuthorization = NO;
        [self reportAuthorizationStatus:status];
    }
    else{
//        NSLog(@"is Requesting Location Authorization: No");
    }
}

// 位置更新回调函数
- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations {
    CLLocation *location = [locations lastObject];
    self.lastLocation = location;
    CLLocationCoordinate2D coordinate = location.coordinate;
    
    // 回调到JavaScript
    NSString *callStr = [NSString stringWithFormat:@"NativeAPI.onLocationChanged(%f, %f)", coordinate.latitude, coordinate.longitude];
    char callChars[256]; // 确保数组足够大以容纳字符串加上null终止符
    [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
    printf("%s\n",callChars);
    CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
        se::ScriptEngine::getInstance()->evalString(callChars);
    });
    
    // 如果是单次定位模式，获取到位置后停止
    if (self.currentMode == LocationModeSingle) {
        [self stopLocationUpdate];
    }
}

// 位置定位失败回调函数
- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    NSLog(@"定位失败: %@", error);
    
    LocationError errorCode = LocationErrorUnknownError;
    
    if (error.code == kCLErrorDenied) {
        errorCode = LocationErrorPermissionDenied;
    } else if (error.code == kCLErrorLocationUnknown) {
        errorCode = LocationErrorTimeout;
    } else if (error.code == kCLErrorNetwork) {
        errorCode = LocationErrorNetworkError;
    }
    
    [self reportLocationError:errorCode];
    
    // 停止定位更新
    [self stopLocationUpdate];
}

#pragma mark - Report to JavaScript

// 通知定位授权状态
- (void)reportAuthorizationStatus:(CLAuthorizationStatus)status {
    // 映射到TypeScript枚举值
    int statusCode;
    switch (status) {
        case kCLAuthorizationStatusNotDetermined:
            // 用户尚未做出选择（初始状态）
            statusCode = 0; break;
        case kCLAuthorizationStatusRestricted:
            // 设备限制导致无法使用定位服务（如家长控制）
            statusCode = 1; break;
        case kCLAuthorizationStatusDenied:
            // 用户明确拒绝授权或全局关闭定位服务
            statusCode = 2; break;
        case kCLAuthorizationStatusAuthorizedAlways:
            // 用户授权应用在任何时间使用定位
            statusCode = 3; break;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            // 用户授权应用在前台运行时使用定位
            statusCode = 4; break;
        default:
            // 未知授权状态
            statusCode = -1; break;
    }
    //    NSLog(@"statusCode:%i", statusCode);

    NSString *isGranted;
    if(statusCode >2){
        isGranted = @"true";
    }
    else{
        isGranted = @"false";
    }
        
    NSString *callStr = [NSString stringWithFormat:@"NativeAPI.onLocationPermissionIsGranted('{\"isGranted\":%@,\"system\":\"IOS\"}')", isGranted];
    char callChars[256]; // 确保数组足够大以容纳字符串加上null终止符
    [callStr getCString:callChars maxLength:sizeof(callChars) encoding:NSUTF8StringEncoding];
    printf("%s\n",callChars);
    
    CC_CURRENT_ENGINE()->getScheduler()->performFunctionInCocosThread([=](){
        se::ScriptEngine::getInstance()->evalString(callChars);
    });
}

// 通知定位错误
- (void)reportLocationError:(LocationError)errorCode {
    NSString *jsCall = [NSString stringWithFormat:@"onLocationError(%d)", (int)errorCode];
    NSLog(@"回调JS: %@", jsCall);
//    se::ScriptEngine::getInstance()->evalString([jsCall UTF8String]);
}

@end
