# Code Notes

Many of these have been moved to [cursorrules](../.cursorrules)

Query cache, cache reducers, optimistic updates, mutation in-flight state and invalidation now
live in [Cache and State](<Cache and State.md>).

## iPad `scrollsToTop`

On iPad, tapping the navigation header is treated as a status-bar tap. That fires `scrollToTop` on every `UIScrollView` still in the native hierarchy with the default `scrollsToTop={true}` — including off-screen overlays and inactive tabs. Set `scrollsToTop={false}` on:

- Overlay / nested scrollers: `AppDrawer`, `AppMenu`, `ContentPostForm`
- Custom-position lists: `DayPlannerTimelineView`, `ScheduleFlatListBase`, `ChatList`
- Shared content wrapper: `ScrollingContentView` (covers Settings and the other screens that use it)

Android ignores the prop. `AppFlashList` and a few raw settings `ScrollView`s still use the default.

## ChatList

`src/Components/Lists/ChatList.tsx` is the chat list for Seamail/LFG/Private Event chats and forum threads (FlashList v2, data oldest to newest), wrapped by `FezConversationListV2` and `ForumConversationListV2`.

The component only wires FlashList up. Each challenge has a concern hook in `src/Hooks/ChatList/` (the refs, timers and effects) and a file in `src/Libraries/ChatList/` (pure decisions, unit tested in `__tests__/unit/TestChatList*.ts`). Each library file's header says what it compensates for:

| Challenge | Hook | Library |
|---|---|---|
| Where the list opens | (component) | `InitialScroll.ts` |
| Landing on the anchor before reveal | `useChatListReadyCheck` | `Anchor.ts` |
| Scrolling to the user's own post | `useChatListOwnItemScroll` | `Pagination.ts` (`isEndAppend`) |
| Floating scroll buttons | `useChatListScrollButtons` | `ScrollButtons.ts` |
| Page fill without scroll events | `useChatListPageFill` | `Pagination.ts` |
| Resize (keyboard) re-pins | `useChatListResizePin` | `Pinning.ts` |
| Scroll, drag and momentum handling | `useChatListScrollHandlers` | `Pagination.ts` |
| Who may scroll the list, and when | `useChatListScrollArbiter` | `ScrollArbiter.ts` (calls `Pinning.ts`) |

The hooks never scroll the list themselves. They report events (scroll, drag, momentum, resize, button press, page fill, own post) to the scroll arbiter, a pure reducer in `ScrollArbiter.ts` whose state is the named modes (`phase` positioning/settled, the user's `gesture`, `following`, the `endPin` window, the pending fill pin and the button target). It returns scroll commands, and `useChatListScrollArbiter` is the only code that runs them and owns their frames. A new scroll goes through a new event and command there, not a `listRef.current.scrollTo*` call in a hook.

Tuning constants live in `src/Libraries/ChatList/Constants.ts`. Things that are easy to break:

- `keyExtractor` is required: FlashList's maintain-visible-content-position is a silent no-op without it, and loading older pages would jump the viewport.
- The list only honors its initial position at mount, so screens freeze the initial scroll index and remount via `key` when it becomes known (`FezChatScreen`, `ForumThreadScreenBase`; index math in `src/Libraries/ChatList/InitialScroll.ts`).
- The parent shows an overlay until `onReadyToShow` fires. It always fires (position reached, empty list, or a ~750ms fallback). For an index anchor the ready check also corrects FlashList's estimate-based `initialScrollIndex` landing with plain `scrollToOffset` nudges, and for an end anchor it does the same when the last item is taller than the viewport (`startRenderingFromBottom` only reaches that item's top); don't swap that for `scrollToIndex`, which raced the initial scroll and overshot.
- The list scrolls to the user's own new posts itself (`isOwnItem`); screens must not call `scrollToEnd` after a send.
- Keyboard: the local `KeyboardAvoidingView` resizes the list. `ChatList` re-pins the bottom on any container resize while the user was near the bottom. There are no keyboard listeners: Android used to land one post short after the keyboard closed, which took delayed re-pins after `keyboardDidShow/Hide`, but that was Paper's tab bar resizing the screen again after the keyboard settled, fixed by `keyboardHidesNavigationBar={false}` (see Keyboard Avoidance below). A user drag (`onScrollBeginDrag`) cancels any pending re-pin and suppresses new ones until the drag and its fling end. Momentum only counts when it starts right after a drag ends: Android fires the momentum events for programmatic animated scrolls too, and treating those as the user cancelled the scroll-to-bottom end pin, so scrolling up right after closing the keyboard is not pulled back down. Do not grow this into a multi-frame loop.
- Nothing in a loaded cell may change height when an older page is prepended. FlashList holds the top of the first visible cell still, so a change inside that cell moves the text below it. Fez day dividers are in the separator (rendered in the earlier post's cell) for this reason: in the later post, the oldest loaded post's divider came and went with each page. They also show whenever the chat has unloaded pages, because `postDayCount` only covers loaded posts and crossing its threshold added every divider at once.
- `patches/@shopify+flash-list+2.3.3.patch`: after correcting for a data change, FlashList picked a new anchor in the same pass. With the "Loading previous..." header on screen that was a just-prepended post with an estimated height, and its measurement error moved the content (up to ~65dp). The patch keeps the old anchor until the next pass. The second half of the patch keeps the cells on screen mounted through a prepend: FlashList picked the rows to render from the pre-correction offset, handed the visible posts' cells to the new posts, and so remounted every visible post (images went back to their spinner, galleries lost their sideways scroll). It also kept measured heights by index, so each belonged to the wrong post. The patch moves the measured layouts with the items and keeps the tracked offset on the anchor until the correction lands. Only lists that pass `maintainVisibleContentPosition.anchorThroughDataUpdates` get this (only `ChatList`); every other FlashList keeps stock behaviour. Measured layouts only move with their items when the anchor shifted by exactly the number of added items (a prepend at the head); any other update falls back to FlashList's own relayout. FlashList is pinned to the patched version; see `docs/Dependencies.md` before upgrading.
- Page loading must not depend on scroll events alone. A first page too short to scroll (a few posts at a small page size) gets none, and `startRenderingFromBottom` leaves FlashList's tracked offset outside its start threshold, so `onStartReached` never fires. `ChatList` checks the position once ready and after each page, re-checking with a doubling delay (capped at 30s) in case a load fails or a refetch cancels it. The bottom alignment margin of such a list disappears as it fills, so the end is pinned through that fill. The check uses FlashList's tracked offset and never the last scroll event: FlashList swallows the scroll event of its own prepend correction, so that event still says the list is at the top, and going by it loaded every older page in a row (and left the scroll-to-top button disabled). That button only greys out at the real beginning: while an older page exists it stays enabled, or it would flick off and on as each page loads.
- No spacer in `ListFooterComponent`: FlashList leaves the footer out of its scroll extent (`getMaxScrollOffset`), so `scrollToEnd` from far away landed short and then hopped the footer's height. `ChatList` puts the gap below the last post inside the last cell instead. Horizontal padding goes in `contentContainerStyle`, not `style`, so the scroll indicator stays on the screen edge.
- On Android, an animated `scrollTo` is cancelled wherever it is when the native `maintainVisibleContentPosition` shifts the offset (`scrollToPreservingMomentum` cancels the fling animator). FlashList makes that shift whenever a cell above the viewport measures or a page arrives, which is common right after a fling, so the scroll-to-top button often just stopped the fling. The scroll buttons resend a scroll that ends short of its edge (on momentum end, up to 3 times within 2s); a touch on the list drops the retry.
- `START_RENDERING_FROM_BOTTOM` in `src/Libraries/ChatList/Constants.ts` is the one-line switch for the fallback that opens at the last item index instead (short chats then top-align).
- Do not add Reanimated `entering`/`exiting`/`layout` animations to chat items (Shopify/flash-list#2052).

## Checkpoints

Checkpoints are feature gates that block screen content on certain conditions. Used to gate preregistration, not logged in, etc.

A new checkpoint screen (`src/Screens/Checkpoint`) must also be added to `CheckpointPreview` (`src/Enums/CheckpointPreview.ts`). That drives Settings > Developers > Checkpoints, which previews the blocked view of every checkpoint without arranging the state that would normally trigger it.

### Ordering

Outermost to innermost, checkpoints compose as:

```tsx
<MaintenanceModeScreen>
  <LoggedInScreen>
    <PreRegistrationScreen helpScreen={CommonStackComponents.exampleHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.example} urlPath={'/example'}>
        <ExampleScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  </LoggedInScreen>
</MaintenanceModeScreen>
```

`MaintenanceModeScreen` goes outermost: if the server is restricting access at all, nothing else about the screen (login state, pre-reg, feature flag) matters yet. `LoggedInScreen` is next, since the rest of the checks are meaningless without a session; omit it for a screen that's genuinely usable while logged out — Swiftarr's `flexRoutes` endpoints (performers, hunts, boardgames, karaoke browsing/search) are readable anonymously, so those screens skip `LoggedInScreen` and go straight from `MaintenanceModeScreen` to `PreRegistrationScreen`. `PreRegistrationScreen` and `DisabledFeatureScreen` keep their existing relative order from the default screen-wrapping pattern.

A screen that's viewable while logged out must still hide (not just query-gate) any control that only makes sense for a logged-in user — e.g. `BoardgameListScreen`'s Favorites toggle is hidden via `isLoggedIn` rather than relying on the query to reject an anonymous `favorite` filter. And a screen that's inherently per-user even though its feature area is otherwise open (e.g. `KaraokeFavoritesListScreen`) keeps `LoggedInScreen` rather than dropping it just because sibling screens in the same feature do.

## Keyboard Avoidance

`AppView` no longer owns a global `KeyboardAvoidingView` (see issue #573) — it caused double compensation on form screens and fought the chat list's `maintainVisibleContentPosition` on chat screens. Keyboard handling is per-screen now. Pick based on what the screen actually contains:

**Plain scrollable form (no fixed bottom composer).** Nothing to do — `ScrollingContentView` already wraps `KeyboardAwareScrollView` internally and handles it. This is the common case (most Settings/create/edit screens).

**A form/list with a fixed-height control pinned below it** (a `ContentPostForm` composer below a `ScrollingContentView`, or below a chat `ChatList`, via `FezConversationListV2`/`ForumConversationListV2`). Wrap both as flex siblings in a local `KeyboardAvoidingView`:

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

**Do NOT use `react-native-keyboard-controller`'s `KeyboardStickyView` / `useKeyboardChatComposerInset` for this.** They were tried for the chat composer and are broken for our layout: `KeyboardStickyView`'s `translateY` assumes the view's resting position is flush with the true screen bottom, but our composers sit above the bottom tab bar, so the computed shift falls short by roughly the tab bar's height and the composer ends up rendered behind the keyboard. Confirmed on-device (Android emulator, `uiautomator` bounds dump) before reverting to the plain `KeyboardAvoidingView` above. If you're tempted to reach for these components again, verify on a real device/emulator with the keyboard actually open — the bug does not show up in static review.

`KeyboardAvoidingView`'s `keyboardVerticalOffset` is a heuristic (`insets.top + insets.bottom`, `+40` on home-button iPhones), not a true measurement — it approximates the distance from the top of the KAV to the top of the screen. It only works correctly when the KAV is mounted near the top of the screen's own render tree (directly inside `AppView`, not buried under several wrapper views) — see `useKeyboardVerticalOffset` (`src/Hooks/Keyboard/useKeyboardVerticalOffset.ts`) for the exact formula and rationale.

The bottom tab bar stays in the layout while the keyboard is open (`keyboardHidesNavigationBar={false}` in `AppBottomTabBar`). Paper's Android default hides the bar only after `keyboardDidShow` and restores it only after `keyboardDidHide`, so every composer screen resized a second time after each keyboard transition: a visible flicker on open, and on close the chat list drew at full height with the bar sliding over the composer. The keyboard covers the bar anyway, and the KAV padding is measured from its own frame, so the offset heuristic above is unaffected.

## ScrollingContentView `isStack`

`isStack` says whether a navigation header sits above the screen. `false` (the current default) adds a top margin so content clears the top of a headerless screen; `true` adds none, so the first child controls its own spacing (`PaddedContentView padTop={true}`, or a full-width banner that should sit flush under the header).

- Any screen shown under a navigation header: pass `isStack={true}`. That is nearly every screen. A full-width banner as the first child is the case that visibly breaks without it: it floats one margin below the header (the OOBE server screen's permission banner did).
- `isStack={false}`: only headerless screens. Today that is the OOBE welcome, location and pre-registration screens.
- Wrapper views that render the `ScrollingContentView` for a screen (e.g. `ServerChoiceView`, `AccountChoiceView`) should default to `true` for the same reason.
- Audit (Nov 2026): about 160 usages pass `true`. About 35 mostly older form screens rely on the default and a few others pass `false` while under a header (`KrakenView`, `KrakenTalkReceiveScreen`, `ForumPostEditScreen`); they depend on the margin because their first child has no `padTop`. Moving those to `isStack={true}` with `padTop` on the first child is what lets the default flip to `true`. Until then, always pass `isStack` explicitly in new code.

## Swipeables

Always call `swipeable.close()`, never `swipeable.reset()`. In gesture-handler v3
`reset()` doesn't clear `shouldEnableTap` (the tap-to-close gesture) or `showRightProgress`, and
unlike `close()`/`openLeft()`/`openRight()` it isn't scheduled onto the UI thread — from a JS
`onPress` its shared-value writes can land across frames. Net effect: a permanently armed tap
gesture over the row (swallows the next tap; can cancel a fresh pan) and rows that visibly jump
open/closed. `close()` routes through the library's own `animateRow` and doesn't have these bugs.

For a navigation action (push a screen), navigate first, then `close()` after — not before. Closing
first races the swipe-close animation against the screen transition. The row is still closed by
the time the user navigates back either way.

For a destructive/mutating action, `close()` before calling `mutate()`, not in `onSettled`: if
`onSuccess` drops the row from the cache (e.g. via a cache reducer), `onSettled` fires against an
already-unmounted swipeable.

Derive a swipe button's pending state from the mutation, not per-row `useState`:
`mutation.isPending && mutation.variables?.id === itemId`. FlashList recycles cells, so local state
(and the mutation observer) outlives the item it was started for; matching on the variables keeps
a spinner from showing up on whatever thread the cell is recycled into. Use a separate mutation
instance per action (e.g. Forum favorite vs. mute) so one action's in-flight state can't overwrite
the other's.

## Day Planner Card Menus

The list card menus (`EventCardActionsMenu` etc.) wrap the card as the Paper `Menu` anchor. Do not
do that for `DayPlannerCard`: Paper renders an element anchor inside a plain `View`, which collapses
an absolutely positioned card (its percentage `left`/`width` resolve against the zero-size wrapper)
and measures the anchor as 0x0, so the menu opens in the wrong place. The planner instead has one
`DayPlannerCardActionsMenu` per page, anchored at the long-press coordinates (`anchor={{x, y}}`,
which Paper supports natively), and reuses the list menus' `*ActionsMenuItems` so both offer the
same actions.

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
