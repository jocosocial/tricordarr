internal import Expo

/// Scene delegate required by the iOS 27 SDK. Expo's base class creates the window from the
/// connecting scene, starts React Native, and forwards URL, user-activity and lifecycle events
/// to `AppDelegate` and the Expo app delegate subscribers.
@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
	// Extension point for scene-specific behavior.
}
