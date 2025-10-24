#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (NativeTricordarrModule, NSObject)

RCT_EXTERN_METHOD(blurTextInImage : (NSString *)
                      inputFilePath callback : (RCTResponseSenderBlock)callback)

@end
