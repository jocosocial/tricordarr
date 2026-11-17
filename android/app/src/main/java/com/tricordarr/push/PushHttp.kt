package com.tricordarr.push

import android.content.Context
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

/** Shared OkHttp clients. Uses the OkHttp 4.9.2 that React Native bundles; do not force 5.x. */
object PushHttp {
  @Volatile private var socketClientInstance: OkHttpClient? = null
  @Volatile private var apiClientInstance: OkHttpClient? = null

  /**
   * Adds the same `X-Swiftarr-Client` identity the JS side sends (`<app name> <version>`, see
   * `src/Libraries/Network/ClientHeaders.ts`) and `Cache-Control: no-store` to every request.
   */
  private fun clientIdentityInterceptor(context: Context): Interceptor {
    val appContext = context.applicationContext
    val appName = appContext.applicationInfo.loadLabel(appContext.packageManager).toString()
    val version = appContext.packageManager.getPackageInfo(appContext.packageName, 0).versionName ?: "unknown"
    val identity = "$appName $version"
    return Interceptor { chain ->
      chain.proceed(
        chain.request().newBuilder()
          .header("X-Swiftarr-Client", identity)
          .header("Cache-Control", "no-store")
          .build()
      )
    }
  }

  /** For the long-lived notification socket. The 30s ping detects half-open connections. */
  fun socketClient(context: Context): OkHttpClient =
    socketClientInstance ?: synchronized(this) {
      socketClientInstance ?: OkHttpClient.Builder()
        .addInterceptor(clientIdentityInterceptor(context))
        .pingInterval(30, TimeUnit.SECONDS)
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()
        .also { socketClientInstance = it }
    }

  /** For one-shot API calls such as Mark as Read. */
  fun apiClient(context: Context): OkHttpClient =
    apiClientInstance ?: synchronized(this) {
      apiClientInstance ?: socketClient(context).newBuilder()
        .pingInterval(0, TimeUnit.MILLISECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .callTimeout(30, TimeUnit.SECONDS)
        .build()
        .also { apiClientInstance = it }
    }
}
