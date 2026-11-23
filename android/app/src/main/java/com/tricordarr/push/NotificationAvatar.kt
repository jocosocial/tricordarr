package com.tricordarr.push

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.util.Log
import androidx.core.graphics.drawable.IconCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.load.model.GlideUrl
import java.util.concurrent.TimeUnit

/**
 * Builds the sender avatar for a chat notification: the author's photo when it can be had, a
 * letter avatar otherwise.
 *
 * The photo goes through Glide, which FastImage also uses in this process. FastImage keys its disk
 * cache on the bare URL, and [NotificationPlan.avatarThumbUrl] is the URL AvatarImage loads, so a
 * photo the app has shown is read from disk with no request, and one fetched here is cached for the app.
 */
object NotificationAvatar {
  private const val TAG = "NotificationAvatar"
  private const val SIZE_DP = 64
  private const val CACHE_TIMEOUT_MS = 1_000L

  /**
   * One try on the ship network. Callers run on the account's socket reader thread, so this must
   * stay well under the 30s ping interval.
   */
  private const val NETWORK_TIMEOUT_MS = 4_000L

  /** The avatar for [plan]'s author, or null when the event carries no author. Never call on the main thread. */
  fun icon(context: Context, plan: NotificationPlan): IconCompat? {
    val author = plan.author ?: return null
    val px = (SIZE_DP * context.resources.displayMetrics.density).toInt()
    val photo = plan.avatarThumbUrl?.let { loadPhoto(context, it, px) }
    return IconCompat.createWithBitmap(photo ?: letterAvatar(NotificationPlanner.avatarInitials(author.username), px))
  }

  /** Cache first, then one bounded network attempt. Null on any failure. */
  private fun loadPhoto(context: Context, url: String, px: Int): Bitmap? {
    load(context, url, px, cacheOnly = true, CACHE_TIMEOUT_MS)?.let { return it }
    return load(context, url, px, cacheOnly = false, NETWORK_TIMEOUT_MS)
  }

  private fun load(context: Context, url: String, px: Int, cacheOnly: Boolean, timeoutMs: Long): Bitmap? {
    val glide = Glide.with(context.applicationContext)
    val target = glide.asBitmap()
      .load(GlideUrl(url))
      .onlyRetrieveFromCache(cacheOnly)
      .circleCrop()
      .submit(px, px)
    return try {
      // copy() so the bitmap outlives the Glide request, which is cleared below.
      target.get(timeoutMs, TimeUnit.MILLISECONDS).copy(Bitmap.Config.ARGB_8888, false)
    } catch (e: Exception) {
      if (!cacheOnly) {
        Log.w(TAG, "Could not load avatar, using letters", e)
      }
      null
    } finally {
      glide.clear(target)
    }
  }

  /** A brand-blue circle with [initials] in white, sized down for two- and three-letter aliases. */
  private fun letterAvatar(initials: String, px: Int): Bitmap {
    val bitmap = Bitmap.createBitmap(px, px, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val radius = px / 2f
    canvas.drawCircle(radius, radius, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = NotificationBuilder.BRAND_COLOR })
    val text = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.WHITE
      typeface = Typeface.DEFAULT_BOLD
      textAlign = Paint.Align.CENTER
      textSize = px * when (initials.length) {
        1 -> 0.5f
        2 -> 0.4f
        else -> 0.3f
      }
    }
    val baseline = radius - (text.descent() + text.ascent()) / 2
    canvas.drawText(initials, radius, baseline, text)
    return bitmap
  }
}
