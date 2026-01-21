//
//  ImageBlur.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 10/30/25.
//

import Foundation
import React
import UIKit
import Vision
import os
import TricordarrKit

// Class that handles image processing for features such as the Photostream.
//
// This is exposed to the TurboModule ObjC runtime which connects to the `NativeTricordarrModule` on the
// JavaScript side (specs/NativeTricordarrModule.ts).
//
@objc class ImageBlur: NSObject {
	// Function to blur the text in an image.
	//
	// The typing of the callback here is a bit gross. Getting it happy in the JS side took some handwaving.
	//
	// The logic of this function is a combination of the Android implementation here and the iOS implementation
	// from The Kraken. https://github.com/challfry/TheKraken/blob/master/Kraken/Photostream/PhotostreamCamera.swift
	//
	@objc static public func blurTextInImage(
		_ inputFilePath: String,
		callback: @escaping RCTResponseSenderBlock
	) {
		Logging.logger.info("[ImageBlur.swift] got inputFilePath: \"\(inputFilePath)\"")

		// Run the heavy work off the main thread.
		DispatchQueue.global(qos: .userInitiated)
			.async {
				do {
					// Normalize input into a file URL.
					let inputURL: URL = {
						if let url = URL(string: inputFilePath), url.isFileURL {
							return url
						}
						else {
							return URL(fileURLWithPath: inputFilePath)
						}
					}()

					guard let sourceImage = UIImage(contentsOfFile: inputURL.path),
						let cgImage = sourceImage.cgImage
					else {
						Logging.logger.error("[ImageBlur.swift] Failed to load image from path: \(inputFilePath)")
						DispatchQueue.main.async { callback([inputFilePath]) }
						return
					}

					// Use Vision to detect text regions.
					let textRequest = VNRecognizeTextRequest()
					textRequest.recognitionLevel = .fast
					textRequest.usesLanguageCorrection = false
					// We only need bounding boxes; prevent full text computation where possible
					if #available(iOS 16.0, *) {
						textRequest.revision = VNRecognizeTextRequestRevision3
					}

					let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
					do {
						try handler.perform([textRequest])
					}
					catch {
						Logging.logger.error(
							"[ImageBlur.swift] Vision perform() failed: \(String(describing: error))"
						)
						DispatchQueue.main.async { callback([inputFilePath]) }
						return
					}

					let observations = (textRequest.results) ?? []

					// Prepare a combined clipping path of all detected text lines.
					let imageSize = CGSize(width: cgImage.width, height: cgImage.height)
					let clipPath = CGMutablePath()
					for obs in observations {
						// VN boundingBox is normalized with origin in lower-left. Convert to image pixels with origin at upper-left.
						let bb = obs.boundingBox
						let rect = CGRect(
							x: bb.origin.x * imageSize.width,
							y: (1.0 - bb.origin.y - bb.size.height) * imageSize.height,
							width: bb.size.width * imageSize.width,
							height: bb.size.height * imageSize.height
						)
						clipPath.addRect(rect.integral)
					}

					// Build a small (thumbnail) image and draw it scaled back up over the clipped regions to simulate blur.
					// Size down aggressively similar to Android implementation (divide by 64), ensuring minimum of 1px.
					let smallWidth = max(1, Int(imageSize.width) / 64 + 1)
					let smallHeight = max(1, Int(imageSize.height) / 64 + 1)
					let smallSize = CGSize(width: smallWidth, height: smallHeight)

					// Create scaled-down image
					let smallRendererFormat = UIGraphicsImageRendererFormat.default()
					smallRendererFormat.scale = 1
					let smallRenderer = UIGraphicsImageRenderer(size: smallSize, format: smallRendererFormat)
					let smallImage = smallRenderer.image { _ in
						// Draw original image scaled down to smallSize
						UIImage(cgImage: cgImage, scale: 1.0, orientation: .up)
							.draw(in: CGRect(origin: .zero, size: smallSize))
					}

					// Create destination image, draw original, then clip and paint the scaled-up small image.
					let destRendererFormat = UIGraphicsImageRendererFormat.default()
					destRendererFormat.scale = 1
					let destRenderer = UIGraphicsImageRenderer(size: imageSize, format: destRendererFormat)
					let destImage = destRenderer.image { ctx in
						// Draw the original first
						UIImage(cgImage: cgImage, scale: 1.0, orientation: .up)
							.draw(in: CGRect(origin: .zero, size: imageSize))

						// If any text regions were found, clip and draw the blurred content
						if !clipPath.isEmpty {
							ctx.cgContext.addPath(clipPath)
							ctx.cgContext.clip()
							smallImage.draw(in: CGRect(origin: .zero, size: imageSize))
						}
					}

					// Write a temporary JPEG file and return its path
					guard let jpegData = destImage.jpegData(compressionQuality: 0.9) else {
						Logging.logger.error("[ImageBlur.swift] Failed to encode JPEG data.")
						DispatchQueue.main.async { callback([inputFilePath]) }
						return
					}

					let tempDir = FileManager.default.temporaryDirectory
					let outputURL = tempDir.appendingPathComponent("imageBlurResult_\(UUID().uuidString).jpg")
					do {
						try jpegData.write(to: outputURL, options: [.atomic])
						Logging.logger.info("[ImageBlur.swift] output file path is \(outputURL.path)")
						DispatchQueue.main.async { callback([outputURL.path]) }
					}
					catch {
						Logging.logger.error(
							"[ImageBlur.swift] Failed writing output file: \(String(describing: error))"
						)
						DispatchQueue.main.async { callback([inputFilePath]) }
					}
				}
			}
	}
}
