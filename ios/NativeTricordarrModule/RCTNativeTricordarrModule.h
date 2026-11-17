//
//  RCTNativeTricordarrModule.h
//  Tricordarr
//
//  Created by Grant Cohoe on 10/23/25.
//

#import <Foundation/Foundation.h>
#import <NativeTricordarrModuleSpec/NativeTricordarrModuleSpec.h>

NS_ASSUME_NONNULL_BEGIN

// Subclasses the generated base so the spec's EventEmitter members (Android-only events) are wired.
@interface RCTNativeTricordarrModule : NativeTricordarrModuleSpecBase <NativeTricordarrModuleSpec>

@end

NS_ASSUME_NONNULL_END
