package com.tricordarr.push

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Log
import java.io.File
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Encrypted store of the accounts the push service connects for. The file is encrypted with an
 * app-owned AndroidKeyStore AES-GCM key. JS pushes the full list through `syncPushAccounts`;
 * native never reads expo-secure-store's internal format.
 *
 * If the Keystore key is lost (restore, OEM bug) the file is unreadable, and [load] returns an
 * empty list until JS syncs again. The service then stops itself rather than crash-looping.
 */
class PushAccountStore(context: Context) {
  private val file = File(File(context.filesDir, "push").apply { mkdirs() }, "accounts.enc")

  /** Accounts in the store, or an empty list if there are none or they cannot be decrypted. */
  @Synchronized
  fun load(): List<PushAccount> {
    if (!file.exists()) {
      return emptyList()
    }
    return try {
      val bytes = file.readBytes()
      val iv = bytes.copyOfRange(0, IV_BYTES)
      val cipher = Cipher.getInstance(TRANSFORMATION)
      cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), GCMParameterSpec(TAG_BITS, iv))
      val plain = cipher.doFinal(bytes, IV_BYTES, bytes.size - IV_BYTES)
      PushAccount.listFromJson(String(plain, Charsets.UTF_8))
    } catch (e: Exception) {
      Log.e(TAG, "Unable to read the push account store", e)
      emptyList()
    }
  }

  /** Replaces the stored list. Writes via a temp file so a crash cannot leave a torn store. */
  @Synchronized
  fun save(accounts: List<PushAccount>) {
    val cipher = Cipher.getInstance(TRANSFORMATION)
    cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
    val encrypted = cipher.doFinal(PushAccount.listToJson(accounts).toByteArray(Charsets.UTF_8))
    val temp = File(file.parentFile, "accounts.enc.tmp")
    temp.writeBytes(cipher.iv + encrypted)
    if (!temp.renameTo(file)) {
      file.delete()
      check(temp.renameTo(file)) { "Unable to replace the push account store" }
    }
  }

  @Synchronized
  fun clear() {
    file.delete()
  }

  private fun getOrCreateKey(): SecretKey {
    val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
    (keyStore.getKey(KEY_ALIAS, null) as? SecretKey)?.let { return it }
    val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
    generator.init(
      KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .build(),
    )
    return generator.generateKey()
  }

  companion object {
    private const val TAG = "PushAccountStore"
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val KEY_ALIAS = "tricordarr_push_accounts"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val IV_BYTES = 12
    private const val TAG_BITS = 128
  }
}
