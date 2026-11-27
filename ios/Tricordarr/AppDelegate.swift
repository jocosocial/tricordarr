internal import Expo
import React
import ReactAppDependencyProvider
import TricordarrKit
import UIKit

@main
class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {
	// The scene delegate (ExpoAppSceneDelegate) creates the window and starts React Native into it.
	// iOS 27 traps at launch for apps that have not adopted the UIScene lifecycle.
	var reactNativeFactoryModuleName: String { "Tricordarr" }

	var window: UIWindow?

	var reactNativeDelegate: ReactNativeDelegate?
	var reactNativeFactory: RCTReactNativeFactory?

	override func application(
		_ application: UIApplication,
		didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
	) -> Bool {
		// Clear Keychain on first launch after reinstall
		Keychain.clearIfNecessary()

		let delegate = ReactNativeDelegate()
		let factory = ExpoReactNativeFactory(delegate: delegate)
		delegate.dependencyProvider = RCTAppDependencyProvider()

		reactNativeDelegate = delegate
		reactNativeFactory = factory

		// Lets @mattermost/react-native-paste-input locate TextInput views by tag. Without it,
		// pasting an image into a composer delivers no paste event.
		PasteInputModule.setup(factory.rootViewFactory)

		// Setup foreground notification handler. This has to be done pretty early in the app
		// startup process otherwise we could miss notification events.
		// https://developer.apple.com/documentation/usernotifications/unusernotificationcenterdelegate
		UNUserNotificationCenter.current().delegate = Notifications.shared
		Notifications.appForegrounded()

		// We do not trigger the push notification system to start here. We need configuration that
		// comes from the JavaScript side.

		return super.application(application, didFinishLaunchingWithOptions: launchOptions)
	}

	// Deep links, universal links and app lifecycle events arrive on ExpoAppSceneDelegate, which
	// forwards them to the ExpoAppDelegate subscribers and RCTLinkingManager.
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
	override func sourceURL(for bridge: RCTBridge) -> URL? {
		// needed to return the correct URL for expo-dev-client.
		bridge.bundleURL ?? bundleURL()
	}

	override func bundleURL() -> URL? {
		#if DEBUG
			RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
		#else
			Bundle.main.url(forResource: "main", withExtension: "jsbundle")
		#endif
	}
}
