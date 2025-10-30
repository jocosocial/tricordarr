//
//  ImageBlur.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 10/30/25.
//

import Foundation
import React
import os

// Class that handles image processing for features such as the Photostream.
//
// This is exposed to the TurboModule ObjC runtime which connects to the `NativeTricordarrModule` on the
// JavaScript side (specs/NativeTricordarrModule.ts).
//
@objc class ImageBlur: NSObject {
  // Common logger. Some day this should probably be in its own class or something.
  static let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "com.jocosocial.unknown", category: "ImageBlur")
  
  // Function to blur the text in an image.
  //
  // The typing of the callback here is a bit gross. Getting it happy in the JS side took some handwaving.
  @objc static public func blurTextInImage(_ inputFilePath: String, callback: @escaping RCTResponseSenderBlock) {
    logger.info("[ImageBlur.swift] got inputFilePath: \"\(inputFilePath)\"")
    callback([inputFilePath])
  }
}
