#import "RCTAudioEngine.h"
#import "Tricordarr-Swift.h"

@interface RCTAudioEngine () <AudioEngineCoreDelegate>
@property (nonatomic, strong) AudioEngineCore *engine;
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
  return @[@"onAudioData"];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeAudioEngineSpecJSI>(params);
}

#pragma mark - NativeAudioEngineSpec

- (void)start:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [self.engine start:resolve rejecter:reject];
}

- (void)stop:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [self.engine stop:resolve rejecter:reject];
}

- (void)setMuted:(BOOL)muted resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [self.engine setMuted:muted resolver:resolve rejecter:reject];
}

- (void)setSpeakerOn:(BOOL)speakerOn resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [self.engine setSpeakerOn:speakerOn resolver:resolve rejecter:reject];
}

- (void)playAudio:(NSArray *)audioData {
  [self.engine playAudio:audioData];
}

- (void)addListener:(NSString *)eventName {
  [super addListener:eventName];
}

- (void)removeListeners:(double)count {
  [super removeListeners:count];
}

#pragma mark - AudioEngineCoreDelegate

- (void)audioEngineDidCaptureAudioData:(NSArray<NSNumber *> *)samples {
  [self sendEventWithName:@"onAudioData" body:@{@"samples": samples}];
}

@end
