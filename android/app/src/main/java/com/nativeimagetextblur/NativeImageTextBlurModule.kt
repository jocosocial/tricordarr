package com.nativeimagetextblur

// import com.facebook.react.bridge.ReactApplicationContext
// import com.facebook.react.bridge.ReactContextBaseJavaModule
// import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import java.io.File
import java.io.FileOutputStream
import android.util.Log
import android.graphics.*
import android.graphics.Bitmap.CompressFormat
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.*
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
// This get codegen'd from specs/NativeImageTextBlur.ts.
import com.nativeimagetextblur.NativeImageTextBlurSpec

class NativeImageTextBlurModule(reactContext: ReactApplicationContext) : NativeImageTextBlurSpec(reactContext) {

  override fun getName() = NAME
// class ImageTextBlurModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  // val context = reactContext
  // override fun getName() = "ImageTextBlurModule"

  // Loads the image file specified by `name` from the local fs, crops the image to a square,
  // uses OCR to scan the image for text, blurs any discovered text areas, saves the image to
  // the temp directory. Calls the callback with the path of the processed image, or if an error occurs,
  // calls the callback with the original file path.
  override fun blurTextInImage(name: String, callback: Callback) {
    try {
      Log.d(getName(), "Start of blurTextInImage function, called with $name.")
      val opts = BitmapFactory.Options()
      val inputFilePath = Uri.parse(name).getPath()
      val sourceMap = BitmapFactory.decodeFile(inputFilePath, opts)
      // This was originally written to automatically crop to square but that
      // doesn't allow the user to specify the crop area. The PhotostreamImageSelectionView
      // has been altered to provide the user with cropping before calling this function.
      // val destSize = if (sourceMap.height < sourceMap.width) sourceMap.height else sourceMap.width
      // val destMap = Bitmap.createBitmap(sourceMap, (sourceMap.width - destSize) / 2,
      //   (sourceMap.height - destSize) / 2, destSize, destSize)
      // https://stackoverflow.com/questions/13119582/immutable-bitmap-crash-error
      // java.lang.IllegalStateException: Immutable bitmap passed to Canvas constructor
      val destMap = sourceMap.copy(Bitmap.Config.ARGB_8888, true)

      // OCR the image; we'll use the locations of found text, but don't care about contents
      val recognizer = TextRecognition.getClient(TextRecognizerOptions.Builder().build())
      val image = InputImage.fromBitmap(destMap, 0)
      recognizer.process(image)
        .addOnSuccessListener { visionText ->
          if (visionText.textBlocks.isNotEmpty()) {
            Log.d(getName(), "Text detected in image.")

            // Build the clipping path. All the disjoint text blocks can be put into a single 'Path' object.
            val textPoly = Path()
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
            Log.d(getName(), "Finished building textPoly.")

            // Create a thumbnail sized bitmap from the original, then scale the thumbnail bitmap
            // back up to full size, painting it over the original bitmap, with a clip region that
            // will limit drawing to the discovered text lines.
            val smallMap = Bitmap.createScaledBitmap(destMap, destMap.width / 64 + 1, destMap.height / 64 + 1, true)
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
          val outputFilePath = outputFile.getAbsolutePath()
          Log.d(getName(), "output file path is $outputFilePath.")
          callback.invoke(outputFilePath)
        }
        .addOnFailureListener { e ->
          Log.d(getName(), "Error during text detection: $e.")
          callback.invoke(name)
        }
    }
    catch (e: Exception) {
      Log.d(getName(), "Error loading image file: $e.")
      callback.invoke(name)
    }
  }

  companion object {
    const val NAME = "NativeImageTextBlur"
  }
}
