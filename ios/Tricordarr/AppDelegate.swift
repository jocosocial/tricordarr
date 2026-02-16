import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import UIKit
import TricordarrKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
	var window: UIWindow?

	var reactNativeDelegate: ReactNativeDelegate?
	var reactNativeFactory: RCTReactNativeFactory?

	func application(
		_ application: UIApplication,
		didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
	) -> Bool {
		// Clear Keychain on first launch after reinstall
//		Keychain.clearIfNecessary()
		
		let delegate = ReactNativeDelegate()
		let factory = RCTReactNativeFactory(delegate: delegate)
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

		return true
	}

	// https://reactnavigation.org/docs/deep-linking/#set-up-with-bare-react-native-projects
	func application(
		_ app: UIApplication,
		open url: URL,
		options: [UIApplication.OpenURLOptionsKey: Any] = [:]
	) -> Bool {
		return RCTLinkingManager.application(app, open: url, options: options)
	}
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
	override func sourceURL(for bridge: RCTBridge) -> URL? {
		self.bundleURL()
	}

	override func bundleURL() -> URL? {
		#if DEBUG
			RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
		#else
			Bundle.main.url(forResource: "main", withExtension: "jsbundle")
		#endif
	}
}
