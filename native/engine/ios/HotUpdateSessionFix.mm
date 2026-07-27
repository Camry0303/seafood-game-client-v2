/**
 * HotUpdateSessionFix.mm
 *
 * 修复：iOS 企业签名/重签后热更新下载 manifest 失败（code 1 = ERROR_DOWNLOAD_MANIFEST）。
 *
 * 根因：Cocos 引擎 DownloaderImpl-apple.mm 在 iOS 上强制使用 NSURLSession 后台会话
 * （backgroundSessionConfigurationWithIdentifier:，标识前缀 "BackgroundDownloadIdentifier"）。
 * iOS 后台下载守护进程 nsurlsessiond 会对后台任务严格鉴权，当描述文件为通配符
 * 或 Bundle ID 被重签修改时（企业签/超级签平台常见），后台任务被系统拒绝，
 * 导致 manifest 下载失败。参考：forum.cocos.org/t/topic/142817、/t/topic/163441。
 *
 * 方案：通过 Method Swizzling 拦截 backgroundSessionConfigurationWithIdentifier:，
 * 仅当 identifier 以 "BackgroundDownloadIdentifier" 开头（即 Cocos 热更下载器）时，
 * 改为返回前台 defaultSessionConfiguration，绕过 nsurlsessiond 鉴权；
 * 其它调用方不受影响。无需修改 Creator 引擎源码，随项目仓库管理。
 *
 * 代价：热更下载失去"退到后台继续下载"能力。本项目切后台即暂停游戏，无实际影响。
 */

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
    // 仅拦截 Cocos 热更下载器创建的后台会话，改用前台会话，
    // 避免企业签名后 nsurlsessiond 鉴权失败导致 manifest 下载失败。
    if ([identifier hasPrefix:@"BackgroundDownloadIdentifier"]) {
        NSLog(@"[HotUpdateSessionFix] intercept '%@' -> defaultSessionConfiguration", identifier);
        return [NSURLSessionConfiguration defaultSessionConfiguration];
    }
    // 其它调用走原实现（已交换，调用自身即原方法）
    return [self huf_backgroundSessionConfigurationWithIdentifier:identifier];
}

@end
