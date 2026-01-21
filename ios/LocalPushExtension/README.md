# LocalPushExtension

This is a separate process that gets automagically spawned by the system to manage connections to a backend server. See [Local Push Connectivity](https://developer.apple.com/documentation/networkextension/local-push-connectivity) how that works.

Extensions are basically separate threads from the main application. They should generally be pretty isolated. See [App Extensions](https://developer.apple.com/documentation/technologyoverviews/app-extensions) for more.

## Build & Test

Run the `LocalPushExtension` scheme in Xcode with a target of a real phone. Use the `Tricordarr` app when asked for what application to launch.
