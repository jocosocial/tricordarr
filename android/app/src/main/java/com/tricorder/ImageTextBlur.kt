package com.tricordarr

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import java.io.File
import java.io.FileOutputStream
import android.util.Log
import android.graphics.*
import android.graphics.Bitmap.CompressFormat
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.*
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

class ImageTextBlurModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  val context = reactContext
  override fun getName() = "ImageTextBlurModule"

  // Loads the image file specified by `name` from the local fs, crops the image to a square,
  // uses OCR to scan the image for text, blurs any discovered text areas, saves the image to
  // the temp directory. Calls the callback with the path of the processed image, or if an error occurs,
  // calls the callback with the original file path.
  @ReactMethod fun blurTextInImage(name: String, callback: Callback) {
    try {
      Log.d("ImageTextBlurModule", "Start of blurTextInImage function, called with $name.")
      var opts = BitmapFactory.Options()
      var inputFilePath = Uri.parse(name).getPath()
      var sourceMap = BitmapFactory.decodeFile(inputFilePath, opts)
      var destSize = if (sourceMap.getHeight() < sourceMap.getWidth()) sourceMap.getHeight() else sourceMap.getWidth()
      var destMap = Bitmap.createBitmap(sourceMap, (sourceMap.getWidth() - destSize) / 2,
        (sourceMap.getHeight() - destSize) / 2, destSize, destSize)

      // OCR the image; we'll use the locations of found text, but don't care about contents
      val recognizer = TextRecognition.getClient(TextRecognizerOptions.Builder().build())
      val image = InputImage.fromBitmap(destMap, 0)
      recognizer.process(image)
        .addOnSuccessListener { visionText ->
          if (!visionText.textBlocks.isEmpty()) {
            Log.d("ImageTextBlurModule", "Text detected in image.")

            // Build the clipping path. All the disjoint text blocks can be put into a single 'Path' object.
            var textPoly = Path()
            for (block in visionText.textBlocks) {
              for (line in block.lines) {
                val cornerPoints = line.cornerPoints
                if (cornerPoints != null) {
                  textPoly.moveTo(cornerPoints[0].x.toFloat(), cornerPoints[0].y.toFloat())
                  for (point in cornerPoints) {
                    textPoly.lineTo(point.x.toFloat(), point.y.toFloat())
                  }
                  textPoly.lineTo(cornerPoints[0].x.toFloat(), cornerPoints[0].y.toFloat())
                }
              }
            }

            // Create a thumbmail sized bitmap from the original, then scale the thumbnail bitmap
            // back up to full size, painting it over the original bitmap, with a clip region that
            // will limit drawing to the discovered text lines.
            var smallMap = Bitmap.createScaledBitmap(destMap, destMap.width / 64 + 1, destMap.height / 64 + 1, true)
            val sourceRect = Rect(0, 0, smallMap.width, smallMap.height)
            val destRect = Rect(0, 0, destMap.width, destMap.height)
            var canvas = Canvas(destMap)
            canvas.clipPath(textPoly)
            canvas.drawBitmap(smallMap, sourceRect, destRect, Paint())
          }

          // Write the output file
          var outputFile = File.createTempFile("photostreamUpload", ".jpg")
          var out = FileOutputStream(outputFile)
          destMap.compress(CompressFormat.JPEG, 90, out)
          var outputFilePath = outputFile.getAbsolutePath()
          Log.d("ImageTextBlurModule", "output file path is $outputFilePath.")
          callback.invoke(outputFilePath)
        }
        .addOnFailureListener { e ->
          Log.d("ImageTextBlurModule", "Error during text detection: $e.")
          callback.invoke(name)
        }
    }
    catch (e: Exception) {
      Log.d("ImageTextBlurModule", "Error loading image file: $e.")
      callback.invoke(name)
    }
  }
}
