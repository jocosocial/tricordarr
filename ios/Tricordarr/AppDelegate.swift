internal import Expo
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import TricordarrKit
import UIKit

@main
class AppDelegate: ExpoAppDelegate {
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

		window = UIWindow(frame: UIScreen.main.bounds)

		factory.startReactNative(
			withModuleName: "Tricordarr",
			in: window,
			launchOptions: launchOptions
		)

		// Setup foreground notification handler. This has to be done pretty early in the app
		// startup process otherwise we could miss notification events.
		// https://developer.apple.com/documentation/usernotifications/unusernotificationcenterdelegate
		UNUserNotificationCenter.current().delegate = Notifications.shared
		Notifications.appForegrounded()

		// We do not trigger the push notification system to start here. We need configuration that
		// comes from the JavaScript side.

		return super.application(application, didFinishLaunchingWithOptions: launchOptions)
	}

	// https://docs.expo.dev/bare/installing-expo-modules/
	// https://github.com/expo/expo/blob/sdk-57/templates/expo-template-bare-minimum/ios/HelloWorld/AppDelegate.swift#L34-L51
	// Used to be:
	// https://reactnavigation.org/docs/deep-linking/#set-up-with-bare-react-native-projects
	// Linking API
	public override func application(
		_ app: UIApplication,
		open url: URL,
		options: [UIApplication.OpenURLOptionsKey: Any] = [:]
	) -> Bool {
		return super.application(app, open: url, options: options)
			|| RCTLinkingManager.application(app, open: url, options: options)
	}

	// Universal Links
	public override func application(
		_ application: UIApplication,
		continue userActivity: NSUserActivity,
		restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
	) -> Bool {
		let result = RCTLinkingManager.application(
			application,
			continue: userActivity,
			restorationHandler: restorationHandler
		)
		return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
	}
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
