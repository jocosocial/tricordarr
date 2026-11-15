package com.tricordarr.push

import android.content.Context
import android.util.Log
import org.json.JSONObject
import java.io.File

/**
 * Appends `fgs`-source entries to the same JSONL file JS reads for the notification log
 * (`<documents>/notifications/notification-log.jsonl`, where expo-file-system's `Paths.document`
 * is the app files dir). The format must stay in step with `src/Libraries/NotificationLog/parsing.ts`.
 * `timestamp` is epoch milliseconds, which `new Date()` in the parser accepts alongside the ISO
 * strings JS writes. Entries carry the `accountID` whose socket delivered the event.
 */
object NotificationLogWriter {
  private const val TAG = "NotificationLogWriter"
  private const val MAX_ENTRIES = 1000
  private const val PRUNE_CHECK_BYTES = 256 * 1024L

  fun append(context: Context, accountID: String, type: String, raw: String, data: JSONObject?) {
    try {
      val entry = JSONObject().apply {
        put("timestamp", System.currentTimeMillis())
        put("type", type)
        put("contentID", data?.opt("contentID")?.toString() ?: "")
        put("info", data?.optString("info", "") ?: "")
        put("source", "fgs")
        put("raw", raw)
        put("accountID", accountID)
      }
      synchronized(this) {
        val file = File(File(context.filesDir, "notifications").apply { mkdirs() }, "notification-log.jsonl")
        file.appendText(entry.toString() + "\n")
        if (file.length() > PRUNE_CHECK_BYTES) {
          prune(file)
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Failed to record notification event", e)
    }
  }

  private fun prune(file: File) {
    val lines = file.readLines().filter { it.isNotBlank() }
    if (lines.size > MAX_ENTRIES) {
      file.writeText(lines.takeLast(MAX_ENTRIES).joinToString("\n") + "\n")
    }
  }
}
