# Code Notes

Many of these have been moved to [cursorrules](../.cursorrules)

Query cache, cache reducers, optimistic updates, mutation in-flight state and invalidation now
live in [Cache and State](<Cache and State.md>).

## iPad `scrollsToTop`

On iPad, tapping the navigation header is treated as a status-bar tap. That fires `scrollToTop` on every `UIScrollView` still in the native hierarchy with the default `scrollsToTop={true}` — including off-screen overlays and inactive tabs. Set `scrollsToTop={false}` on:

- Overlay / nested scrollers: `AppDrawer`, `AppMenu`, `ContentPostForm`
- Custom-position lists: `DayPlannerTimelineView`, `ScheduleFlatListBase`, `ConversationList`, `ConversationListV2`
- Shared content wrapper: `ScrollingContentView` (covers Settings and the other screens that use it)

Android ignores the prop. `AppFlashList` and a few raw settings `ScrollView`s still use the default.

## Checkpoints

Checkpoints are feature gates that block screen content on certain conditions. Used to gate preregistration, not logged in, etc.

A new checkpoint screen (`src/Screens/Checkpoint`) must also be added to `CheckpointPreview` (`src/Enums/CheckpointPreview.ts`). That drives Settings > Developers > Checkpoints, which previews the blocked view of every checkpoint without arranging the state that would normally trigger it.

## Keyboard Avoidance

`AppView` no longer owns a global `KeyboardAvoidingView` (see issue #573) — it caused double compensation on form screens and fought `LegendList`'s `maintainVisibleContentPosition` on chat screens. Keyboard handling is per-screen now. Pick based on what the screen actually contains:

**Plain scrollable form (no fixed bottom composer).** Nothing to do — `ScrollingContentView` already wraps `KeyboardAwareScrollView` internally and handles it. This is the common case (most Settings/create/edit screens).

**A form/list with a fixed-height control pinned below it** (a `ContentPostForm` composer below a `ScrollingContentView`, or below a chat `ConversationListV2`/`FezConversationListV2`/`ForumConversationListV2`). Wrap both as flex siblings in a local `KeyboardAvoidingView`:

```tsx
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {useKeyboardVerticalOffset} from '#src/Hooks/Keyboard/useKeyboardVerticalOffset';

const keyboardVerticalOffset = useKeyboardVerticalOffset();
const {commonStyles} = useStyles();

return (
  <AppView>
    <KeyboardAvoidingView style={commonStyles.flex} behavior={'padding'} keyboardVerticalOffset={keyboardVerticalOffset}>
      <ScrollingContentView>...</ScrollingContentView>  {/* or the list, in its own flex:1 View + overlay */}
      <ContentPostForm ... />
    </KeyboardAvoidingView>
  </AppView>
);
```

Reference implementations: `FezChatScreen.tsx`, `ForumThreadScreenBase.tsx` (list + composer), `SeamailCreateScreen.tsx`, `ForumPostEditScreen.tsx`, `ForumThreadCreateScreen.tsx` (form + composer).

**Do NOT use `react-native-keyboard-controller`'s `KeyboardStickyView` / `KeyboardAwareLegendList` / `useKeyboardChatComposerInset` for this.** They were tried for the chat composer and are broken for our layout: `KeyboardStickyView`'s `translateY` assumes the view's resting position is flush with the true screen bottom, but our composers sit above the bottom tab bar, so the computed shift falls short by roughly the tab bar's height and the composer ends up rendered behind the keyboard. Confirmed on-device (Android emulator, `uiautomator` bounds dump) before reverting to the plain `KeyboardAvoidingView` above. If you're tempted to reach for these components again, verify on a real device/emulator with the keyboard actually open — the bug does not show up in static review.

`KeyboardAvoidingView`'s `keyboardVerticalOffset` is a heuristic (`insets.top + insets.bottom`, `+40` on home-button iPhones), not a true measurement — it approximates the distance from the top of the KAV to the top of the screen. It only works correctly when the KAV is mounted near the top of the screen's own render tree (directly inside `AppView`, not buried under several wrapper views) — see `useKeyboardVerticalOffset` (`src/Hooks/Keyboard/useKeyboardVerticalOffset.ts`) for the exact formula and rationale.

## Websocket Keepalive

https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104

## Native Code

### Codegen

Do not attempt to run `npx @react-native-community/cli codegen` or `npx react-native codegen`. Those commands are not fully baked and undocumented. If you want to re-run Codegen just do a build.

```
[Codegen] Analyzing /Users/grant/Projects/jocosocial/tricordarr/package.json
[Codegen] TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
[Codegen] Done.
```

That is because the `--outputDir` is empty. And there isn't an easy way to automatically set the correct output directories. Can be done, but ugh.

### Android Studio

Open the `android` directory in Android Studio instead of the project root. It behaves better. Might be able to mark a different one as Project Root?
https://stackoverflow.com/questions/70816347/i-cant-find-the-image-asset-option-in-android-studio

### Xcode

Open the `ios` directory in Xcode or `open` the `Tricordarr.xcworkspace` file.

### Expo Prebuild / app.json Plugins

Do not include plugins in `app.json` since we have a custom native code structure. I'm open to changing this some day.
