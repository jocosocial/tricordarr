package com.tricordarr.nativemodule

import com.facebook.react.bridge.Callback
import android.util.Log
import android.graphics.*
import android.graphics.Bitmap.CompressFormat
import android.net.Uri
import java.io.File
import java.io.FileOutputStream
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

/**
 * Image processing helpers (Android) for features such as the Photostream.
 */
object ImageBlur {
  private const val TAG = "ImageBlur"

  /**
   * Loads the image file specified by [inputFilePath] from the local fs, scans for text using OCR,
   * blurs any discovered text areas, writes a temporary JPEG, and invokes [callback] with the
   * output path. On failures, [callback] receives the original input path.
   */
  fun blurTextInImage(inputFilePath: String, callback: Callback) {
    try {
      Log.d(TAG, "Start of blurTextInImage function, called with $inputFilePath.")
      val opts = BitmapFactory.Options()
      val parsedPath = Uri.parse(inputFilePath).path
      val sourceMap = BitmapFactory.decodeFile(parsedPath, opts)
      // Make a mutable bitmap for drawing
      val destMap = sourceMap.copy(Bitmap.Config.ARGB_8888, true)

      // OCR the image; we'll use the locations of found text, but don't care about contents
      val recognizer = TextRecognition.getClient(TextRecognizerOptions.Builder().build())
      val image = InputImage.fromBitmap(destMap, 0)
      recognizer.process(image)
        .addOnSuccessListener { visionText ->
          if (visionText.textBlocks.isNotEmpty()) {
            Log.d(TAG, "Text detected in image.")

            // Build the clipping path combining all text line polygons
            val textPoly = Path()
            for (block in visionText.textBlocks) {
              for (line in block.lines) {
                val cornerPoints = line.cornerPoints
                if (cornerPoints != null && cornerPoints.isNotEmpty()) {
                  textPoly.moveTo(cornerPoints[0].x.toFloat(), cornerPoints[0].y.toFloat())
                  for (point in cornerPoints) {
                    textPoly.lineTo(point.x.toFloat(), point.y.toFloat())
                  }
                  textPoly.lineTo(cornerPoints[0].x.toFloat(), cornerPoints[0].y.toFloat())
                }
              }
            }
            Log.d(TAG, "Finished building textPoly.")

            // Create a thumbnail bitmap then scale it back up and draw over the text regions
            val smallMap = Bitmap.createScaledBitmap(
              destMap,
              destMap.width / 64 + 1,
              destMap.height / 64 + 1,
              true
            )
            val sourceRect = Rect(0, 0, smallMap.width, smallMap.height)
            val destRect = Rect(0, 0, destMap.width, destMap.height)
            val canvas = Canvas(destMap)
            canvas.clipPath(textPoly)
            canvas.drawBitmap(smallMap, sourceRect, destRect, Paint())
          }

          // Write the output file
          val outputFile = File.createTempFile("photostreamUpload", ".jpg")
          val out = FileOutputStream(outputFile)
          destMap.compress(CompressFormat.JPEG, 90, out)
          val outputFilePath = outputFile.absolutePath
          Log.d(TAG, "output file path is $outputFilePath.")
          callback.invoke(outputFilePath)
        }
        .addOnFailureListener { e ->
          Log.d(TAG, "Error during text detection: $e.")
          callback.invoke(inputFilePath)
        }
    } catch (e: Exception) {
      Log.d(TAG, "Error loading image file: $e.")
      callback.invoke(inputFilePath)
    }
  }
}


