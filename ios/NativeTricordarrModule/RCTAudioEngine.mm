#import "RCTAudioEngine.h"
#import <UserNotifications/UserNotifications.h>
#import <TricordarrKit/TricordarrKit-Swift.h>

@interface RCTAudioEngine () <AudioEngineCoreDelegate>
@property(nonatomic, strong) AudioEngineCore *engine;
@end

@implementation RCTAudioEngine

+ (NSString *)moduleName {
  return @"AudioEngine";
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _engine = [[AudioEngineCore alloc] init];
    _engine.delegate = self;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[ @"onAudioData" ];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeAudioEngineSpecJSI>(params);
}

#pragma mark - NativeAudioEngineSpec

// The call metadata is Android-only: there it identifies the call for the foreground service and
// the in-call notification. On iOS CallKit owns the incoming-call UI and the call identity, so the
// arguments are accepted and ignored.
- (void)start:(NSString *)callID
    callerName:(NSString *)callerName
   startTimeMs:(double)startTimeMs
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject {
  [self.engine start:resolve rejecter:reject];
}

- (void)stop:(RCTPromiseResolveBlock)resolve
      reject:(RCTPromiseRejectBlock)reject {
  [self.engine stop:resolve rejecter:reject];
}

- (void)setMuted:(BOOL)muted
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  [self.engine setMuted:muted resolver:resolve rejecter:reject];
}

- (void)setSpeakerOn:(BOOL)speakerOn
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  [self.engine setSpeakerOn:speakerOn resolver:resolve rejecter:reject];
}

- (void)playAudio:(NSArray *)audioData {
  [self.engine playAudio:audioData];
}

// No-ops on iOS. Incoming calls are presented by CallKit, not by a notification the app builds.
- (void)showIncomingCall:(NSString *)callID
              callerName:(NSString *)callerName
            callerUserID:(NSString *)callerUserID {
  NSLog(@"[AudioEngine] showIncomingCall is a no-op on iOS; CallKit presents incoming calls");
}

- (void)dismissCallNotification {
  NSLog(@"[AudioEngine] dismissCallNotification is a no-op on iOS");
}

- (void)addListener:(NSString *)eventName {
  [super addListener:eventName];
}

- (void)removeListeners:(double)count {
  [super removeListeners:count];
}

#pragma mark - AudioEngineCoreDelegate

- (void)audioEngineDidCaptureAudioData:(NSArray<NSNumber *> *)samples {
  [self sendEventWithName:@"onAudioData" body:@{@"samples" : samples}];
}

@end
