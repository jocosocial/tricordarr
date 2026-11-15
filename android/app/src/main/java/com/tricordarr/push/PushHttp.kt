package com.tricordarr.push

import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

/** Shared OkHttp clients. Uses the OkHttp 4.9.2 that React Native bundles; do not force 5.x. */
object PushHttp {
  /** For the long-lived notification socket. The 30s ping detects half-open connections. */
  val socketClient: OkHttpClient by lazy {
    OkHttpClient.Builder()
      .pingInterval(30, TimeUnit.SECONDS)
      .connectTimeout(10, TimeUnit.SECONDS)
      .readTimeout(0, TimeUnit.MILLISECONDS)
      .build()
  }

  /** For one-shot API calls such as Mark as Read. */
  val apiClient: OkHttpClient by lazy {
    socketClient.newBuilder()
      .pingInterval(0, TimeUnit.MILLISECONDS)
      .readTimeout(15, TimeUnit.SECONDS)
      .callTimeout(30, TimeUnit.SECONDS)
      .build()
  }
}
