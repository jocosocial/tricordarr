//
// ObjC headers to expose to the Swift runtime.
//
// Unlike the inverse (Swift-to-ObjC) this is not automagically generated for us
// by the build process.
//
// "In general" if you get compilation errors related to the auto-generated
// Tricordarr-Swift.h missing some Apple-smelling type or whatever, it's
// probably because it's missing here.

#import <NetworkExtension/NetworkExtension.h>
#import <RCTAppDelegate.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <UserNotifications/UserNotifications.h>

// @mattermost/react-native-paste-input ships as a static library without a Swift module, and its
// real PasteInputModule.h pulls in C++ codegen headers under RCT_NEW_ARCH_ENABLED, which a
// bridging header can't parse. Declare only the entry point AppDelegate calls; the linker still
// checks it against the library.
@class RCTRootViewFactory;
@interface PasteInputModule : RCTEventEmitter
+ (void)setup:(nonnull RCTRootViewFactory *)rootViewFactory;
@end
