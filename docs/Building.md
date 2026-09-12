# Building

Need Node 21 and Java 17 (Corretto 21 will not work). Use `nvm` and `jenv` to switch between versions.

## Android development APK: eas vs. gradlew

Two ways to produce a local development-client APK, but they are **not**
equivalent builds — see the signing/versionCode note below.

### `eas build --output ./build/Tricordarr-development.apk --local --profile development --platform android`

The `development` eas.json profile has no `buildType`/`gradleCommand` override
and does not set `developmentClient` (only the separate `debug` profile does),
so with `distribution: internal` it resolves to `:app:assembleRelease` — this
produces a **release**-variant APK, signed with EAS-managed release credentials,
using a `versionCode` from EAS's remote version source (`appVersionSource:
"remote"` in eas.json), not the static value in `build.gradle`.

What it does before Gradle ever runs:
1. Makes a fresh git-based shallow copy of the whole repo into a brand-new temp
   directory — on every single invocation.
2. Since `node_modules` is gitignored, it's not part of that copy, so a full
   dependency install happens inside the temp dir first.
3. Only then runs `./gradlew :app:assembleRelease` in that temp dir.
4. Copies the APK out and deletes the temp dir. The plugin refuses to reuse a
   working directory across runs (errors if it isn't empty), so there is no
   supported way to get incremental Gradle reuse through this path.

Cost: effectively a clean CI build every time — full checkout + full `npm
install` + full native (release) build — regardless of how small the change
was. ~400s observed. Useful for verifying cloud-build parity, not for
iterating quickly.

### `npm run build-android-debug-apk`

Runs `cd android && ./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a`
directly against the checked-in `android/` directory (same pattern as the
existing `build-android-apk` / `build-android-aab` release scripts).

Cost: only rebuilds what changed. Keeps the Gradle daemon warm and reuses
`android/build`, `android/.gradle`, and `~/.gradle` caches across runs, plus
`org.gradle.parallel`/`org.gradle.caching` (enabled in `android/gradle.properties`).
Restricted to `arm64-v8a` for speed — drop the `-P` flag (or point it at another
ABI) to build for an emulator.

### Why the "Build Android Development" task still uses `eas`, not the npm script

We tried switching the `.vscode/tasks.json` task to the `gradlew` path above to
speed up the local dev loop, but it doesn't produce an installable-on-device
APK: it builds a *debug*-variant APK signed with the checked-in
`android/app/debug.keystore` and a static `versionCode`, whereas `eas build
--local --profile development` builds a *release*-variant APK signed with
EAS-managed release credentials and a `versionCode` from EAS's remote counter.
Those are two different build variants with different signatures — installing
one over the other hits `adb install` failures with no workaround: version
downgrades are blocked (and on non-userdebug devices `-d` doesn't override
this), and signature mismatches have no override at all (you'd have to `adb
uninstall` first, wiping app data). So the task stays on `eas build --local`,
despite the cost above, to guarantee it can actually reinstall over an
existing on-device build. The npm script above is still useful for quickly
verifying the native build compiles without needing a device install.
