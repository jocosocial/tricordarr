# Code Notes

Many of these have been moved to [cursorrules](../.cursorrules)

## Query

A useful debugging snippet:

```ts
const allJoinedQueries = queryClient
  .getQueryCache()
  .getAll()
  .filter(q => Array.isArray(q.queryKey) && q.queryKey[0] === '/fez/joined');

console.log('[PersonalEvents] total /fez/joined queries:', allJoinedQueries.length);
allJoinedQueries.forEach((q, i) => {
  console.log(`[PersonalEvents] query ${i} key:`, JSON.stringify(q.queryKey));
  console.log(`[PersonalEvents] query ${i} dataUpdatedAt:`, new Date(q.state.dataUpdatedAt).toISOString());
});
```

## iPad `scrollsToTop`

On iPad, tapping the navigation header is treated as a status-bar tap. That fires `scrollToTop` on every `UIScrollView` still in the native hierarchy with the default `scrollsToTop={true}` — including off-screen overlays and inactive tabs. Set `scrollsToTop={false}` on:

- Overlay / nested scrollers: `AppDrawer`, `AppMenu`, `ContentPostForm`
- Custom-position lists: `DayPlannerTimelineView`, `ScheduleFlatListBase`, `ConversationList`, `ConversationListV2`
- Shared content wrapper: `ScrollingContentView` (covers Settings and the other screens that use it)

Android ignores the prop. `AppFlashList` and a few raw settings `ScrollView`s still use the default.

## Checkpoints

Checkpoints are feature gates that block screen content on certain conditions. Used to gate preregistration, not logged in, etc.

A new checkpoint screen (`src/Screens/Checkpoint`) must also be added to `CheckpointPreview` (`src/Enums/CheckpointPreview.ts`). That drives Settings > Developers > Checkpoints, which previews the blocked view of every checkpoint without arranging the state that would normally trigger it.

## Mutation In-Flight State (double-submit prevention)

The app runs on a cruise-ship network: high latency, jitter, occasional packet loss. Any window where a Post/Send/Save control is tappable while its write is still in flight becomes a duplicate write on that network, because the user reasonably assumes a non-spinning button means nothing happened. See #533 ("Forum/Fez Posting Stopped Spinning Too Early") for the incident that prompted this.

Two failure shapes, two different fixes:

**Formik forms.** Formik only lets the _consumer_ own `isSubmitting` when `onSubmit` returns `undefined`. If `onSubmit` is `async`, it always returns a Promise, and Formik clears `isSubmitting` itself as soon as that Promise resolves — not when the network request completes. `ContentPostForm`'s wrapper was `async` but fired `mutation.mutate()` without awaiting it, so the returned promise resolved a microtask after the mutation was merely _started_, re-enabling the button mid-request.

- If your submit handler is `async` (or calls one), it MUST `await mutation.mutateAsync(...)`, not call `mutation.mutate(...)` and return.
- Prefer this over `mutation.mutate()` + `onSettled: () => setSubmitting(false)`. That pattern only works if the handler is fully synchronous; it silently breaks the moment someone adds an `await` above the mutation call (e.g. to save a photo first), and nothing catches the regression short of tapping the button on a slow network.
- Catch mutation rejections inside the handler (`useTokenAuthMutation`/`usePublicMutation` already raise the error snackbar via `onError`) so the rejection doesn't escape into Formik's submit handling.

**Non-Formik controls** (menu items, swipeables, header buttons, anything driving `mutation.mutate()` directly). Formik isn't involved, so there's no default protection at all — you must explicitly disable the control while the mutation is in flight:

- Single mutation: `disabled={mutation.isPending}` on the pressable (`Menu.Item`, `PrimaryActionButton`, etc). `SubmitIconButton` already does this internally via its `submitting` prop.
- Menus specifically: a `Menu.Item`'s parent menu stays open until `onSettled` calls `closeMenu()` (per the Menus convention above), so the item itself needs `disabled`, not just a loading icon — a loading icon alone (`getStateLoadingIcon`) is decorative and does not block a second tap.
- Batch operations (`Promise.allSettled` over several `mutateAsync` calls) aren't covered by any single mutation's `isPending`: track a local `busy` boolean set before the batch starts and cleared after it settles, and fold it into the button's `disabled`. Don't reuse `setRefreshing` for this — that drives the pull-to-refresh spinner on a parent list, not this control's own tappability.

`PrimaryActionButton`'s `isLoading` prop implies `disabled` (so passing one without the other can't happen); other buttons don't get this for free.

See also "Optimistic Cache Updates (local-first reducer pattern)" below: that pattern adds a step _before_ the mutation starts, but doesn't remove the requirement here to disable the control while it's in flight.

## Optimistic Cache Updates (local-first reducer pattern)

If you only update the cache after the server responds, any control whose _appearance_ depends on that cache (a star, a checkmark, a mute icon) sits in the wrong state for the entire round trip — and on the ship's slow network (see "Mutation In-Flight State" above), that's long enough for the user to notice. The fix: for a toggle where you already know the new value the instant the user taps (a boolean flip, a field the user picked), call the reducer _before_ calling `mutation.mutate(...)`, not inside `onSuccess`.

Order of operations:

1. Compute the new value (e.g. `const newValue = !current`).
2. Call the reducer action with that new value — this updates the cache and the UI immediately, before any network request has even started.
3. Call `mutation.mutate(...)`.
4. In `onError`, call the same reducer action again with the _old_ value to roll back, **and** invalidate the relevant keys so the server — not our captured stale copy — gets the last word (see "Rollback is a tiebreak, not a truth" below for why the rollback alone isn't enough).
5. Keep everything already required by "Mutation In-Flight State" (disable the control while pending, `closeMenu()` in `onSettled` for menu items) — this pattern doesn't replace that, it's an addition.
6. Only use `onSuccess` for something that genuinely can't be known until the server responds (see "When NOT to do this" below).

**When NOT to do this:**

- **The new state can't be computed locally.** `PhotographingMenuItem`'s `photographers` header list needs the server's `UserHeader` (name/photo), which the client doesn't have — that part stays a post-success refetch even though the boolean flip itself is optimistic. LFG join (`LFGMembershipView` → `updateMembership`) needs the server's full returned `FezData`, because only the server knows whether you landed in the group or on the waitlist.
- **The action is destructive and confirmed.** Delete, cancel, leave-a-group: the user already confirmed through an alert; rolling back an optimistic delete on failure is a worse surprise than a half-second wait. Apply these in `onSuccess`.
- **The result depends on the server and isn't a simple flip.** Bulk imports, admin diff apply, thread/message create-then-navigate flows: there's no single "new value" to show optimistically, or the screen navigates away before it would matter anyway.

**Why this isn't `onMutate`.** A reader who knows TanStack Query will expect the canonical `onMutate` recipe, and will otherwise "fix" this later. The per-call options accepted by `mutation.mutate(vars, {...})` are only `onSuccess`/`onError`/`onSettled` — `onMutate` is not among them — and our mutation hooks are shared across many call sites, so a hook-level `onMutate` has no way to know which entity the user just tapped. Calling the reducer in the tap handler is the equivalent step, moved to the only place that has the context.

**One-way actions with no rollback.** Some reducer actions have no inverse — `markRead` collapses `readCount` toward `postCount` and can't be un-applied without having captured the prior counts. For these, apply eagerly and say so: there is no `onError` rollback, and a failed request self-heals on the next refetch. Don't let the rule above imply otherwise.

**Rollback is a tiebreak, not a truth.** Inverting the boolean restores the value we _captured at tap time_. If anything else changed the entity during the round trip (a websocket push, a concurrent refetch, the same entity toggled from another screen), the rollback writes stale data back. `updateFavorite` is the sharpest case: it also re-runs `primeEventDetail` with a whole stale `EventData`. Hence the invalidate in step 4.

**The error snackbar still fires.** `useTokenAuthMutation` registers its own `onError` at the hook level (`src/Queries/TokenAuthMutation.ts`), and a per-call `onError` passed to `mutate()` runs _in addition to_ it, not instead. So a rollback handler neither suppresses the snackbar nor needs to raise one itself — don't add a duplicate.

A small before/after, from the real fix in `src/Components/Cards/Schedule/EventCard.tsx`:

```ts
// Before: cache only updates once the network call finishes -- the star sits stale
// for the whole round trip.
eventFavoriteMutation.mutate(
  {eventID: eventData.eventID, action: newValue ? 'favorite' : 'unfavorite'},
  {onSuccess: () => updateFavorite(eventData, newValue)},
);

// After: flip the cache the instant the user taps, roll back on failure.
updateFavorite(eventData, newValue);
eventFavoriteMutation.mutate(
  {eventID: eventData.eventID, action: newValue ? 'favorite' : 'unfavorite'},
  {onError: () => updateFavorite(eventData, !newValue)},
);
```

**Menus keep closing on `onSettled`, not on tap.** This was considered and decided, not overlooked. An optimistic menu item still holds the menu open for the whole round trip, which means the visible win lands on the list underneath rather than in the menu itself. Closing on tap would be the larger UX win, and `AGENTS.md`'s "Toggle / Navigation items: NO `onClose`" line arguably already points that way for a favorite/mute item. We're staying with `onSettled` anyway, because:

- the open menu is where a rollback is legible — the row the user tapped visibly reverts, instead of a snackbar appearing over a screen where something silently un-changed;
- it's the only in-flight feedback these items have (`getStateLoadingIcon` on the row);
- one unconditional rule ("mutating items close in `onSettled`") beats a rule with an "unless it's optimistic" carve-out that every future menu-item author has to evaluate.

A mutating toggle (favorite/mute/pin) counts as a **mutating item** under `AGENTS.md`'s Menus section, not a toggle item — that ambiguity is what makes this worth stating. If we ever revisit, the follow-up order is: fix the in-flight `disabled` gaps first, then rewrite the Menus rules around "can you compute the new value locally", then convert — with verification aimed squarely at the forced-failure path.

**`cancelQueries` before the optimistic write.** TanStack's optimistic-update recipe starts with `queryClient.cancelQueries(...)` for a reason: a refetch that was already in flight when the user tapped will resolve _after_ our optimistic write and stomp it back to the stale value — the same flicker this pattern exists to remove, on the same slow network that makes the window wide. Rather than asking every call site to remember this, the cancel is folded into the reducer actions themselves (`updateFavorite`, `updateMute`, `updatePinned`, `updatePostPin`, `updatePostBookmark`), since they already know which query keys they touch. `cancelQueries` returns a promise; the reducers stay synchronous and fire it without awaiting (fire-and-forget) rather than becoming `async`, since callers already treat these as synchronous cache writes.

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
