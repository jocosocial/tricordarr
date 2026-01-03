//
//  Keychain.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 1/3/26.
//

import Foundation
import Security
import TricordarrKit

/**
 Keychain helper for any credential/security type things we need to do.
 */
public struct Keychain {
  static let logger = Logging.getLogger("Keychain")
	/**
	 Clears all Keychain items on first app launch after reinstall.
	 
	 Checks whether or not this is the first time the app is run using UserDefaults.
	 If it's the first run, sets a flag and deletes all Keychain items across all Keychain classes.
   
   https://github.com/emeraldsanto/react-native-encrypted-storage?tab=readme-ov-file#note-regarding-keychain-persistence
	 */
	public static func clearIfNecessary() {
    Keychain.logger.log("[Keychain.swift] clearIfNecessary")

		// Checks whether or not this is the first time the app is run
		if !UserDefaults.standard.bool(forKey: "HAS_RUN_BEFORE") {
      Keychain.logger.log("[Keychain.swift] App has not run before. Clearing keychain.")
			// Set the appropriate value so we don't clear next time the app is launched
			UserDefaults.standard.set(true, forKey: "HAS_RUN_BEFORE")
			
			let secItemClasses = [
				kSecClassGenericPassword,
				kSecClassInternetPassword,
				kSecClassCertificate,
				kSecClassKey,
				kSecClassIdentity
			]
			
			// Maps through all Keychain classes and deletes all items that match
			for secItemClass in secItemClasses {
				let query: [String: Any] = [kSecClass as String: secItemClass]
				SecItemDelete(query as CFDictionary)
			}
		}
	}
}

