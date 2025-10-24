//
//  RCTNativeTricordarrModule.mm
//  Tricordarr
//
//  Created by Grant Cohoe on 10/23/25.
//

#import "RCTNativeTricordarrModule.h"

@implementation RCTNativeTricordarrModule

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
  // TODO: Implement image text blurring logic
  // 1. Load image from inputFilePath
  // 2. Detect text regions in the image (using Vision framework)
  // 3. Apply blur to detected regions
  // 4. Save processed image
  // 5. Return the processed file path

  // Placeholder: Return the input file path
  callback(@[ inputFilePath ]);
}

@end
