//
//  RCTNativeTricordarrModule.mm
//  Tricordarr
//
//  Created by Grant Cohoe on 10/23/25.
//

#import "RCTNativeTricordarrModule.h"
#import "Tricordarr-Swift.h"

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
  [ImageBlur blurTextInImage:inputFilePath callback:callback];
}

- (void)setupLocalPushManager:(nonnull NSString *)socketUrl
                        token:(nonnull NSString *)token
             wifiNetworkNames:(nonnull NSArray *)wifiNetworkNames
             healthcheckTimer:(double)healthcheckTimer
                       enable:(BOOL)enable {
  NSLog(@"setupLocalPushManager called with parameters:");
  NSLog(@"  socketUrl: %@", socketUrl);
  NSLog(@"  token: %@", token);
  NSLog(@"  wifiNetworkNames: %@", wifiNetworkNames);
  NSLog(@"  healthcheckTimer: %f", healthcheckTimer);
  NSLog(@"  enable: %@", enable ? @"YES" : @"NO");
}

@end
