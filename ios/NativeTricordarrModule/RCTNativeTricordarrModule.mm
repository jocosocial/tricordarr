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

// One entry per synced account, whichever of the extension or the in-app provider runs its socket.
- (void)getWebsocketStatus:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  resolve([Notifications getWebsocketStatusDictionaries]);
}

// The extension and the in-app provider each hold one socket per account in this list, and an
// empty list turns them off.
- (void)syncPushAccounts:(nonnull NSString *)accountsJson {
  [Notifications syncPushAccountsWithAccountsJson:accountsJson];
}

- (void)setPushAccountEnabled:(nonnull NSString *)accountID
                      enabled:(BOOL)enabled {
  NSLog(@"setPushAccountEnabled is a no-op on iOS; JS syncs the full list instead");
}

- (void)startBackgroundService {
  NSLog(@"startBackgroundService is a no-op on iOS");
}

- (void)stopBackgroundService {
  NSLog(@"stopBackgroundService is a no-op on iOS");
}

- (void)showCallNotification:(nonnull NSString *)remoteUsername
                 startedAtMs:(double)startedAtMs
                     isMuted:(BOOL)isMuted {
  NSLog(@"showCallNotification is a no-op on iOS; CallKit presents the call");
}

- (void)dismissCallNotification {
  NSLog(@"dismissCallNotification is a no-op on iOS");
}

- (void)cancelContentNotification:(nonnull NSString *)accountID
                        contentID:(nonnull NSString *)contentID {
  [Notifications cancelContentNotificationWithAccountID:accountID
                                              contentID:contentID];
}

- (void)cancelSecondaryNotifications:(nonnull NSString *)accountID
                  secondaryContentID:(nonnull NSString *)secondaryContentID {
  [Notifications cancelSecondaryNotificationsWithAccountID:accountID
                                        secondaryContentID:secondaryContentID];
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
