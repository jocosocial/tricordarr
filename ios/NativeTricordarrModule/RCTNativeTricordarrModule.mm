//
//  RCTNativeTricordarrModule.mm
//  Tricordarr
//
//  Created by Grant Cohoe on 10/23/25.
//

#import "RCTNativeTricordarrModule.h"
#import <React/RCTBridge.h>
#import <UserNotifications/UserNotifications.h>
#import <TricordarrKit/TricordarrKit-Swift.h>

@implementation RCTNativeTricordarrModule

// Name of the module. This must align with the directory structure and the
// specs/NativeTricordarrModule.ts spec file on the JS side and the
// `.codegenConfig` in package.json.
+ (NSString *)moduleName {
  return @"NativeTricordarrModule";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeTricordarrModuleSpecJSI>(
      params);
}

- (void)blurTextInImage:(nonnull NSString *)inputFilePath
               callback:(nonnull RCTResponseSenderBlock)callback {
  [ImageBlur blurTextInImage:inputFilePath
                    callback:^(NSArray *_Nonnull results) {
                      callback(results);
                    }];
}

- (void)setAppConfig:(nonnull NSString *)appConfigJson {
  [AppConfig setAppConfigWithAppConfigJson:appConfigJson];
}

- (void)setupLocalPushManager:(nonnull NSString *)socketUrl
                        token:(nonnull NSString *)token
                       enable:(BOOL)enable {
  NSLog(@"setupLocalPushManager called with parameters:");
  NSLog(@"  socketUrl: %@", socketUrl);
  NSLog(@"  token: %@", token);
  NSLog(@"  enable: %@", enable ? @"YES" : @"NO");

  [AppConfig setupLocalPushManagerWithSocketUrl:socketUrl
                                          token:token
                                         enable:enable];
}

- (void)getBackgroundPushManagerStatus:(RCTPromiseResolveBlock)resolve
                                reject:(RCTPromiseRejectBlock)reject {
  NSDictionary *status =
      [Notifications getBackgroundPushManagerStatusDictionary];
  resolve(status);
}

- (void)getForegroundPushProviderStatus:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
  NSDictionary *status =
      [Notifications getForegroundPushProviderStatusDictionary];
  resolve(status);
}

// iOS runs a single extension socket and does not know JS's account IDs, so it reports one entry
// under a fixed ID. Multi-account sockets in the extension are a later phase.
- (void)getWebsocketStatus:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *status =
      [[Notifications getWebsocketStatusDictionary] mutableCopy];
  status[@"accountID"] = @"default";
  resolve(@[ status ]);
}

// Thin wrapper over setupLocalPushManager for the single-account case: the first enabled account
// becomes the extension's socket, and an empty list clears everything. JS still drives iOS
// through setupLocalPushManager until that is retired.
- (void)syncPushAccounts:(nonnull NSString *)accountsJson {
  NSData *data = [accountsJson dataUsingEncoding:NSUTF8StringEncoding];
  NSArray *accounts = data ? [NSJSONSerialization JSONObjectWithData:data
                                                             options:0
                                                               error:nil]
                           : nil;
  if (![accounts isKindOfClass:[NSArray class]] || accounts.count == 0) {
    [Notifications clearSettings];
    return;
  }
  NSDictionary *account = accounts.firstObject;
  NSString *serverUrl = account[@"serverUrl"];
  NSString *urlPrefix = account[@"urlPrefix"] ?: @"";
  NSString *token = account[@"token"];
  if (![serverUrl isKindOfClass:[NSString class]] ||
      ![token isKindOfClass:[NSString class]]) {
    NSLog(@"syncPushAccounts: first account is missing serverUrl or token");
    return;
  }
  NSString *socketUrl = [NSString
      stringWithFormat:@"%@%@/notification/socket", serverUrl, urlPrefix];
  if ([socketUrl hasPrefix:@"https://"]) {
    socketUrl = [socketUrl stringByReplacingCharactersInRange:NSMakeRange(0, 5)
                                                   withString:@"wss"];
  } else if ([socketUrl hasPrefix:@"http://"]) {
    socketUrl = [socketUrl stringByReplacingCharactersInRange:NSMakeRange(0, 4)
                                                   withString:@"ws"];
  }
  BOOL enabled = [account[@"enabled"] boolValue];
  [AppConfig setupLocalPushManagerWithSocketUrl:socketUrl
                                          token:token
                                         enable:enabled];
}

- (void)setPushAccountEnabled:(nonnull NSString *)accountID
                      enabled:(BOOL)enabled {
  NSLog(@"setPushAccountEnabled is a no-op on iOS (single account)");
}

- (void)startBackgroundService {
  NSLog(@"startBackgroundService is a no-op on iOS");
}

- (void)stopBackgroundService {
  NSLog(@"stopBackgroundService is a no-op on iOS");
}

// Notification identifiers are the content ID (see Notifications.generateContentNotification).
- (void)cancelContentNotification:(nonnull NSString *)accountID
                        contentID:(nonnull NSString *)contentID {
  [[UNUserNotificationCenter currentNotificationCenter]
      removeDeliveredNotificationsWithIdentifiers:@[ contentID ]];
}

- (void)cancelSecondaryNotifications:(nonnull NSString *)accountID
                  secondaryContentID:(nonnull NSString *)secondaryContentID {
  NSLog(@"cancelSecondaryNotifications is a no-op on iOS; JS uses notify-kit there");
}

- (void)clearLocalPushManager {
  [Notifications clearSettings];
}

- (void)getNotificationLog:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  NSString *log = [NotificationLog read];
  resolve(log);
}

- (void)clearNotificationLog {
  [NotificationLog clear];
}

@end
