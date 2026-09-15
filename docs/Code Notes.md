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

## Mutation In-Flight State (double-submit prevention)

The app runs on a cruise-ship network: high latency, jitter, occasional packet loss. Any window where a Post/Send/Save control is tappable while its write is still in flight becomes a duplicate write on that network, because the user reasonably assumes a non-spinning button means nothing happened. See #533 ("Forum/Fez Posting Stopped Spinning Too Early") for the incident that prompted this.

Two failure shapes, two different fixes:

**Formik forms.** Formik only lets the *consumer* own `isSubmitting` when `onSubmit` returns `undefined`. If `onSubmit` is `async`, it always returns a Promise, and Formik clears `isSubmitting` itself as soon as that Promise resolves — not when the network request completes. `ContentPostForm`'s wrapper was `async` but fired `mutation.mutate()` without awaiting it, so the returned promise resolved a microtask after the mutation was merely *started*, re-enabling the button mid-request.

  - If your submit handler is `async` (or calls one), it MUST `await mutation.mutateAsync(...)`, not call `mutation.mutate(...)` and return.
  - Prefer this over `mutation.mutate()` + `onSettled: () => setSubmitting(false)`. That pattern only works if the handler is fully synchronous; it silently breaks the moment someone adds an `await` above the mutation call (e.g. to save a photo first), and nothing catches the regression short of tapping the button on a slow network.
  - Catch mutation rejections inside the handler (`useTokenAuthMutation`/`usePublicMutation` already raise the error snackbar via `onError`) so the rejection doesn't escape into Formik's submit handling.

**Non-Formik controls** (menu items, swipeables, header buttons, anything driving `mutation.mutate()` directly). Formik isn't involved, so there's no default protection at all — you must explicitly disable the control while the mutation is in flight:

  - Single mutation: `disabled={mutation.isPending}` on the pressable (`Menu.Item`, `PrimaryActionButton`, etc). `SubmitIconButton` already does this internally via its `submitting` prop.
  - Menus specifically: a `Menu.Item`'s parent menu stays open until `onSettled` calls `closeMenu()` (per the Menus convention above), so the item itself needs `disabled`, not just a loading icon — a loading icon alone (`getStateLoadingIcon`) is decorative and does not block a second tap.
  - Batch operations (`Promise.allSettled` over several `mutateAsync` calls) aren't covered by any single mutation's `isPending`: track a local `busy` boolean set before the batch starts and cleared after it settles, and fold it into the button's `disabled`. Don't reuse `setRefreshing` for this — that drives the pull-to-refresh spinner on a parent list, not this control's own tappability.

`PrimaryActionButton`'s `isLoading` prop implies `disabled` (so passing one without the other can't happen); other buttons don't get this for free.

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
