# Swipeable Implementation Analysis

Analysis of Tricordarr's `ReanimatedSwipeable`-based list rows, written for
[issue #574](https://github.com/jocosocial/tricordarr/issues/574). Covers the root cause behind
the `failOffsetY` patch, a comparison against Bluesky (`~/Projects/public/social-app`) and upstream
RNGH practice, correctness/recycling findings, and a phased remediation plan that another agent can
execute. Written 2026-10-14 against RN 0.86.2, react-native-gesture-handler 3.2.1 (patched),
react-native-reanimated 4.5.x, @shopify/flash-list 2.3.x.

> **Status as of 2026-11-13.** Two things have changed since this was written; the sections below
> are kept as the original analysis and are annotated where they no longer match the code.
>
> - `978b2f91` upgraded RNGH to 3.4.0 (which contains #4582), deleted the 3.2.1 patch and the
>   `failOffsetY` prop, and did most of Phase 2 and Phase 3. See the ticked work items.
> - A separate "row sticks part-way open" bug turned out to be caused by system reduced motion, not
>   by anything analysed here. See [Reduced motion stall](#reduced-motion-stall) directly below.

## Reduced motion stall

Found and fixed 2026-11-13 (`19f67d2b`) against RNGH 3.4.0 and Reanimated 4.5.1, on a Pixel 11 Pro
running Android 17.

**Symptom.** A row swiped part-way and released stays frozen at the release position, then some
time later (300 ms to over a second) jumps fully open or closed with no animation. A full swipe to
the end stop looks fine. Does not reproduce on simulators or emulators.

**Cause.** The device has system animations turned off.

- Reanimated on Android reports reduced motion when `Settings.Global.TRANSITION_ANIMATION_SCALE`
  is `0` (`NativeProxy.getIsReducedMotion`). That is set by Accessibility > "Remove animations" and
  by Developer options > "Transition animation scale: off". It is read once at app start.
- `ReanimatedSwipeable.animateRow` builds its spring with `reduceMotion: ReduceMotion.System`.
  Under reduced motion Reanimated replaces the animation with a single synchronous value set
  (`onFrame = () => true`), so no animation frame is ever requested.
- On Android that lone update, made from the Pan's `onDeactivate` worklet, is not flushed to the
  screen. It only appears when something unrelated causes a flush or a React commit, hence the
  variable delay and the jump.
- A full swipe hides it because the row is already at the clamped end position
  (`overshootLeft` / `overshootRight` are off), so there is nothing left to draw.
- Simulators and emulators have animations on, so they take the normal spring path.

Why the lone update is not flushed was not traced into Reanimated / RNGH. It is an upstream bug
and has not been reported yet.

**Evidence.** Identical injected partial swipe (`adb shell input swipe 850 Y 500 Y 1200`) on the
Seamail list, recorded with `adb shell screenrecord`, which only emits a frame when the screen
changes, so frame timestamps show exactly when the row moved.

| Build | Transition animation scale | After release |
| --- | --- | --- |
| Before fix (FlatList) | 0 | Frozen 309 ms, then fully open in one frame |
| Before fix (FlatList) | 1 (app relaunched) | First spring frame at 8 ms, continuous 120 Hz for about 650 ms |
| After fix (FlatList) | 0 | Open case settled in 9-13 ms; close case in 8 ms |
| After fix (FlashList) | 0 | Open case settled in about 19 ms; close case in about 16 ms |

**Fix.** `BaseSwipeable` reads `useReducedMotion()` and, when it is on, passes `animationOptions`
with `reduceMotion: ReduceMotion.Never` and a spring stiff enough to land within a frame
(`REDUCED_MOTION_ANIMATION_OPTIONS`). The row still snaps with no visible animation, but the settle
goes through the animation-frame path, which does flush. With animations on, nothing changes.
Because `animationOptions` feeds `animateRow`, this also covers `swipeable.close()` and tap-to-close.

**FlatList experiment.** `d04ffa16` swapped the five swipeable lists from FlashList to a
FlatList-backed `AppFlatList` to rule out recycling. It was not the cause and was reverted in
`01781b4c`. On FlashList with the fix, a row swiped open, scrolled to the end of the list and back
comes back closed and no other row shows as open.

**Not verified.** Only Seamail was exercised, with slow injected swipes. Fast finger flicks and
the Forum, User, Karaoke and Boardgame lists share `BaseSwipeable` but were not individually tested.

**Debugging note.** For any "physical device only" animation or gesture bug, check
`adb shell settings get global transition_animation_scale` first.

> **Check upstream first.** (Done in `978b2f91`; kept for history.) The root-cause fix for the scroll "stick"
> ([software-mansion/react-native-gesture-handler#4582](https://github.com/software-mansion/react-native-gesture-handler/pull/4582))
> merged on 2026-10-12, two days before this document was written, and at the time of writing exists
> only in `3.4.0-nightly-20261012`. Before executing Phase 1, check whether a stable RNGH release
> (3.4.0 or later) containing #4582 has shipped. If it has, skip the "pin to 3.2.1 and track"
> steps: upgrade, delete `patches/react-native-gesture-handler+3.2.1.patch` and the `failOffsetY`
> prop in `BaseSwipeable.tsx`, and go straight to the Android verification steps at the end of this
> document. Also check whether
> [#4592](https://github.com/software-mansion/react-native-gesture-handler/pull/4592)
> (pull-to-refresh follow-up) has merged and shipped.

## Verdict on `failOffsetY`

The instinct that "something is wrong" is half right, but the wrong half is not in Tricordarr.

- The scroll "stick" is a confirmed **upstream Android regression in RNGH 3.2.0** (PR
  [software-mansion/react-native-gesture-handler#4367](https://github.com/software-mansion/react-native-gesture-handler/pull/4367)).
  Timeline matches exactly: 3.2.0 shipped Aug 13, Tricordarr bumped to 3.2.1 on Aug 17
  (`02d8aaf6`), the `failOffsetY` patch landed Aug 19 (`3c0cd510`). RN 0.86 itself (which brought
  RNGH 3.1.0 in #551) was not the trigger.
- Mechanism (verified in the installed 3.2.1 source): when RN's `ScrollView` takes the touch it
  calls `requestDisallowInterceptTouchEvent`; `RNGestureHandlerRootHelper` now only calls
  `orchestrator.cancelAllLegacyHandlers()`, which cancels action types 1-4 and skips
  `ACTION_TYPE_NATIVE_DETECTOR` / `VIRTUAL_DETECTOR` (the v3 hook API that `ReanimatedSwipeable`
  uses). The v3 cancel path moved to `RNGestureHandlerDetectorView.requestDisallowInterceptTouchEvent`,
  but that request only bubbles *up* from the ScrollView, so detectors *inside* list rows are never
  reached. The row's Pan sits in BEGAN for the whole vertical scroll; once cumulative horizontal
  drift exceeds `activeOffsetX` (20) it activates, the root starts intercepting and sends
  `ACTION_CANCEL` to the ScrollView. The list stops dead and the row swipes. `failOffsetY=[-8,8]`
  fails the Pan at roughly Android touch slop before that can happen. iOS is unaffected (UIKit fails
  the RNGH recognizer when the UIScrollView pan begins).
- Upstream explicitly **declined the same prop**
  ([#4563](https://github.com/software-mansion/react-native-gesture-handler/issues/4563) /
  PR [#4564](https://github.com/software-mansion/react-native-gesture-handler/pull/4564), closed
  Oct 13: "fixes the symptom, not the root cause"). The root-cause fix is
  [#4582](https://github.com/software-mansion/react-native-gesture-handler/pull/4582) (merged
  Oct 12, present in `3.4.0-nightly-20261012` only; not in 3.3.0). Follow-up
  [#4592](https://github.com/software-mansion/react-native-gesture-handler/pull/4592)
  (pull-to-refresh parking half-pulled) is still open. The maintainer says #4582 also resolves
  [#4561](https://github.com/software-mansion/react-native-gesture-handler/issues/4561) (Android
  jank / missed taps in `ReanimatedSwipeable` lists since 3.2).
- `failOffsetY` on a horizontal Pan is standard practice regardless: Bluesky's RNGH v3 migration
  replaced an `activeOffsetY: [-200, 200]` hack with `failOffsetY: [-10, 10]` on every row-level
  Pan (`src/lib/custom-animations/GestureActionView.tsx`, `src/components/dms/SwipeToReply.tsx`,
  `src/screens/VideoFeed/components/Scrubber.tsx`); RNGH maintainers recommend the same in
  [#3140](https://github.com/software-mansion/react-native-gesture-handler/issues/3140). So the
  *approach* is right; the *patch* is a stopgap to drop once a stable release contains #4582.

```mermaid
sequenceDiagram
  participant Finger
  participant RootView as RNGH RootView
  participant Pan as Row Pan (v3 detector)
  participant SV as RN ScrollView
  Finger->>RootView: ACTION_DOWN
  RootView->>Pan: BEGAN
  Finger->>SV: vertical MOVE > slop
  SV->>RootView: requestDisallowInterceptTouchEvent
  Note over RootView,Pan: 3.2.x cancels only legacy handlers; v3 Pan stays BEGAN
  Finger->>Pan: drift dx > 20
  Pan->>RootView: ACTIVE, start intercepting
  RootView->>SV: ACTION_CANCEL (list stops dead)
  Note over Pan: With failOffsetY [-8,8] the Pan FAILS at dy > 8 instead
```

## Current state

> Describes the code as of 2026-10-14. Since `978b2f91`: RNGH is 3.4.0 with no patch,
> `BaseSwipeable` has no `failOffsetY` and no unused props, and `package.json` declares `^3.4.0`.
> The architecture line and the list inventory are still accurate.

Architecture: `AppFlashList` (FlashList v2, always recycling, plain RN ScrollView) -> memoized
`*ListItem` -> `*ListItemSwipeable` (mutations, per-row `useState` spinners, panels) ->
`BaseSwipeable` (orientation swap, offsets, `failOffsetY`) -> patched `ReanimatedSwipeable` 3.2.1.

- All five swipeable lists (Forum threads, Seamail/Fez, Users, Karaoke, Boardgames) are FlashList
  via `src/Components/Lists/AppFlashList.tsx`. LegendList is only used for chat post lists (no
  swipeables), so its possible removal is irrelevant here. No RN `FlatList` carries swipeables.
- Gesture config in `src/Components/Swipeables/BaseSwipeable.tsx`: `activeOffsetX=[-20,20]`,
  `failOffsetY=[-8,8]`, overshoot off. All other props (`onSwipeableOpen`, `onSwipeableWillOpen`,
  thresholds, `friction`, `overshootFriction`) are unused by every caller. The swipe cone is roughly
  atan(8/20) = 22 degrees from horizontal, stricter than Bluesky's 10/10 (45 degrees).
- Upstream 3.2.1 passes `simultaneousWith` / `requireToFail` / `block` / `hitSlop` through to the
  Pan but not `failOffsetY`. Those relation props only accept RNGH gesture objects, and RN's
  `ScrollView` has none, so they cannot substitute for the patch.
- Patch `patches/react-native-gesture-handler+3.2.1.patch` is a 2-line passthrough on `src/` plus
  the `.d.ts` only (fine for Metro, which resolves the `react-native` field to `src/`; `lib/module`
  is not patched). `package.json` declares `^3.0.1` while the patch targets 3.2.1, so a
  lockfile-less resolve would pick 3.3.x and the patch would fail.
- `docs/Code Notes.md` "Swipeables" section (`close()` not `reset()`, navigate-then-close,
  close-before-mutate) is accurate and should be kept.

## Previous issues (history)

- `b6253fc0` / #187 (2024-09) first Forum swipe and `SwipeableButton`; `06425164` / #243 created
  `BaseSwipeable`.
- `ba8b914b` / `0e05bd41` Seamail rework; the Fez `key` gained `isMuted` / `isFavorite` to fight
  "visual ghosts", with a comment suspecting the real cause was a missing row `backgroundColor`.
  A stale comment remains at `src/Components/Lists/Fez/SeamailFlatList.tsx` L41-46.
- `4d136ba4` (2026-02) recycled cells showed open state: added `key=` on `BaseSwipeable` plus the
  repo rule "Implementors of `BaseSwipeable.tsx` must have a `key`".
- `3c0cd510` (2026-08-19) Android scroll stick after RNGH 3.2.1: `failOffsetY` patch, drag offsets
  raised 10 -> 20.
- `4cae705c` moved swipeable wrapping into memoized item components (`UserFlatListItem`,
  `KaraokeSongListItem`).
- #603 / #628 / #630 optimistic favorite/mute/pin via cache reducers, fez mark-read endpoint, fez
  favoriting; #636 swipe disabled while logged out for Boardgame and Karaoke.
- `c994a3da` / #640 `reset()` -> `close()`, ordering rules, left-panel Remove on user lists,
  square-minimum `SwipeableButton`, Code Notes section.

## Findings beyond the gesture config

### Correctness (highest value)

- **Rollback lives in per-call `mutate(vars, {onError})` callbacks.** TanStack only fires these if
  the observer is still mounted and only for the latest `mutate()` call. On a `?favorite=true` list
  the reducer removes the row immediately, the cell unmounts/recycles, and a failed request leaves
  the cache wrong. Affects the Fez and Forum swipeables and the matching menu / selection-header
  callers.
- **Forum Favorite and Mute share one `relationMutation`**
  (`src/Components/Swipeables/ForumThreadListItemSwipeable.tsx` L25, used at L67 and L100).
  Unfavoriting re-enables Mute optimistically; tapping Mute mid-flight overwrites the favorite
  call's per-call callbacks, so `favoriteRefreshing` sticks `true` and its rollback is lost.
- **Boardgame and Karaoke Favorite have no `disabled` while pending**
  (`BoardgameListItemSwipeable.tsx` L76-83, `KaraokeListItemSwipeable.tsx` L77-84), violating the
  in-flight rule in `AGENTS.md` / `docs/Cache and State.md`. Both also invalidate on success instead
  of using a cache reducer, and two quick taps both send `action: 'favorite'`.
- **Per-row `useState` spinner flags live above the `key`** so they survive FlashList recycling:
  start Favorite on thread A, scroll so the cell is recycled for thread B, B shows the spinner and a
  disabled button; A's `onSettled` later clears B's flag. FlashList ships
  `useRecyclingState(initial, [itemId])` for exactly this. `useMutation` observers are per-instance
  and leak the same way.
- **Fez key includes `isMuted` / `isFavorite`** (`FezChatListItemSwipeable.tsx` L195). Because the
  update is optimistic, the key changes the instant the user taps: the panel snaps shut with no
  animation, the spinner is never seen, and the `onSettled` `close()` targets a dead instance.
  Forum rows stay open with a spinner and animate closed, so the two lists behave differently.
  Likely obsolete now that rows set `backgroundColor`.
- Forum left panel renders an empty fragment when there is no event and the user is not a
  moderator (L150-186), so a rightward swipe claims the gesture for nothing; pass `undefined` the
  way `UserListItemSwipeable` does (L186 / L193).

### Recycling / performance

- `key` on `BaseSwipeable` forces a full remount of the swipeable subtree (including `children`)
  on every recycle. It fixes stale `rowState` / translation but the FlashList v2 performance docs
  say a `key` inside items "will highly degrade performance". `reset()` is not a drop-in
  replacement: in 3.2.1 and 3.3.0 it misses `showRightProgress` and `shouldEnableTap`. Keep the key
  unless profiling says otherwise; a small `reset()` patch is cheaper than a rewrite if it does.
- RNGH 3.2.1 passes a new config object to `usePanGesture` / `useTapGesture` on every render when
  callbacks are inline, re-registering the gesture each render (fixed by
  [#4466](https://github.com/software-mansion/react-native-gesture-handler/pull/4466) in 3.3.0).
  Forum, Fez, Boardgame and Karaoke define `renderLeftPanel` / `renderRightPanel` inline; only
  `UserListItemSwipeable` memoizes them.

### Repo-rule violations

- Inline style objects in Forum (L168, 181, 199, 210, 220), Fez (L144-145, 166, 175, 187),
  Boardgame (L82, 89), Karaoke (L83, 91). Only `UserListItemSwipeable` (L35-47) uses
  `StyleSheet.create` in `useMemo`. Knock-on: `SwipeableButton`'s `useMemo` keys on `props.style`
  and `props.textStyle` so it rebuilds every render.
- Missing docstrings on most handlers; `handlePin` unmemoized; `BaseSwipeable.tsx` L3 deep-imports
  `react-native-gesture-handler/src/components/ReanimatedSwipeable` instead of the public
  `react-native-gesture-handler/ReanimatedSwipeable`.
- Redundant double `close()` in Forum / Fez mark-read (before mutate and again in `onSettled`);
  Forum `handleMarkAsRead` is needlessly `async`.

### Accessibility and help

- No `accessibilityActions` / `onAccessibilityAction` anywhere. Karaoke Favorite is swipe-only
  (`useKaraokeFavoriteMutation` has no other caller).
- `BoardgameHelpScreen` has no swipe chapter; `ForumCategoryHelpScreen` omits the left-panel Event
  action; `MainHelpScreen.tsx` L38-39 says "Appearance Settings" but the orientation toggle is in
  Accessibility settings; direction wording ("swipe left to...") is wrong under
  `reverseSwipeOrientation`.

## Comparison with Bluesky

- Bluesky does not use `ReanimatedSwipeable` at all. Its rows are swipe-to-trigger (Gmail-style,
  always snap back), hand-rolled `usePanGesture` with `activeOffsetX` +/-10 and `failOffsetY`
  +/-10, the unused direction disabled via +/-200, reset in `onFinalize`, haptic on first threshold
  crossing. No `simultaneousWith` / `requireToFail` toward the list; those are reserved for
  explicit pager / drawer / video-list conflicts (`block`, `requireToFail`). On Android the drawer's
  `activeOffsetX` is raised to 20 because a slow swipe does not activate native scroll until touch
  slop (8-16 px) is crossed.
- Bluesky uses plain RN `FlatList` (no FlashList / LegendList) and carries no RNGH / FlashList
  patches. Mutation guards rely on optimistic cache flipping the row's actions rather than
  `disabled`; Tricordarr's stricter rule is appropriate for the ship network.
- Lesson: a custom Pan would hit the *same* Android orchestrator bug, so rewriting away from
  `ReanimatedSwipeable` buys nothing for this problem. Tricordarr needs open-and-hold panels, which
  `ReanimatedSwipeable` provides; keep it.
- Caveat: the Bluesky checkout's `node_modules` has RNGH 2.28.0 even though its `package.json`
  declares `~3.3.0`, so it cannot be used as an "upstream newer source" reference.

## Recommended plan (phased)

### Phase 1: gesture layer (low risk)

- Pin `react-native-gesture-handler` to exact `3.2.1` in `package.json`.
- Hoist `const FAIL_OFFSET_Y: [number, number] = [-8, 8]` to module scope in `BaseSwipeable.tsx`
  so the array literal does not break config memoization.
- Rewrite the `BaseSwipeable.tsx` L50-52 comment to cite RNGH #4367 / #4582 / #4592 and state the
  effect is Android-only. Optionally gate the prop on `isAndroid` from
  `src/Libraries/Platform/Detection.ts`.
- Consider loosening to `dragOffset +/-15` / `failOffsetY +/-10` (about 34 degrees) and test on a
  physical Android device; keep failY at or just above touch slop (8 dp).
- Open a tracking issue: when a stable RNGH release contains #4582 (ideally #4592 too), upgrade,
  delete the patch and the prop, and retest scroll-from-row, fling, and pull-to-refresh from a row
  on Android. If upgrading to 3.3.0 first, the patch must be regenerated and `failOffsetY` added to
  the memoized `panConfig` dependency list; 3.3.0 also brings #4466 (stable configs) and #4441
  (Android button taps during scroll).

### Phase 2: mutation correctness (medium risk, highest payoff)

- Move optimistic apply / rollback into hook-level `useMutation({onMutate, onError, onSettled})`
  with context in `src/Queries/Fez/FezFavoriteMutations.ts`, `FezMuteMutations.ts`,
  `src/Queries/Forum/ForumThreadRelationMutations.ts`, `ForumThreadPinMutations.ts`; update the
  swipeable, `FezChatScreenActionsMenu`, and selection-header callers.
- Split Forum `relationMutation` into separate favorite / mute instances (or disable both buttons
  on `relationMutation.isPending`).
- Boardgame / Karaoke Favorite: add `disabled={favoriteRefreshing}` at minimum, then add
  `useBoardgameCacheReducer` / `useKaraokeCacheReducer` and drop success-path invalidation.
- Replace per-row `useState` spinner flags with `useRecyclingState(false, [itemId])` from
  `@shopify/flash-list` in all five swipeables (or derive from `mutation.isPending` once mutations
  are per-action).
- Drop `isMuted` / `isFavorite` from the Fez key so it keys on `fezID` like the others; delete the
  stale `SeamailFlatList.tsx` L41-46 comment; verify on device that no panel color ghosts through.

### Phase 3: hygiene (low risk)

- `StyleSheet.create` in `useMemo` keyed on `theme` for every panel style; `useCallback` for render
  panels and `handlePin`; public import path in `BaseSwipeable.tsx`; remove unused `BaseSwipeable`
  props or wire them up; `undefined` for empty panels; a single `close()` per action; docstrings.
- Optional: extract `useSwipeableToggle({mutation, apply, rollback, itemId})` returning
  `{onPress, pending}` so each swipeable only declares buttons. Internally uses `useRecyclingState`
  and calls `mutation.reset()` when the item changes.

### Phase 4: accessibility and docs (low risk)

- `accessibilityActions` + `onAccessibilityAction` on the row calling the same handlers (with the
  same in-flight guards); give Karaoke Favorite a non-swipe path (song detail or long-press menu).
- Help screens: Boardgame swipe chapter (and fix its Favorite icon, currently `AppIcons.lfgCreate`),
  Forum Event action, Karaoke Favorite, "Appearance Settings" -> Accessibility settings in
  `MainHelpScreen.tsx`, orientation-neutral direction wording.

### Not recommended

- Replacing `ReanimatedSwipeable` with a custom `Gesture.Pan` (same orchestrator bug, loses
  open-and-hold, `close()` / measurement / RTL for free).
- `react-native-swipeable-item` (last published 2022) or `react-native-swipe-list-view` 4.0 (new
  rewrite, replaces the list model).
- `renderScrollComponent={RNGH ScrollView}` on FlashList is the only structural alternative
  (RNGH's `ScrollView` is a `NativeGesture` with `disallowInterruption: true` whose activation
  would cancel the pending row Pan). Only worth trying if the upstream release slips; untested
  with `RefreshControl` and FlashList internals here.

## Work items

Ticks reflect what the `978b2f91` commit message says it did; they were not re-audited line by line.

- [x] ~~Pin RNGH to exact 3.2.1, hoist `FAIL_OFFSET_Y`, rewrite the `BaseSwipeable` comment.~~
      Superseded: `978b2f91` upgraded straight to 3.4.0 and removed the patch and the prop.
- [x] Upgrade to the first stable RNGH containing #4582 and remove the patch and `failOffsetY`
      (`978b2f91`). The Android scroll / fling / pull-to-refresh retest in Verification is not
      recorded as done.
- [x] Move optimistic apply / rollback into `useMutation` `onMutate` / `onError` for Fez favorite /
      mute and Forum relation / pin mutations; update all callers (`978b2f91`).
- [x] Split `ForumThreadListItemSwipeable`'s shared `relationMutation` into separate favorite /
      mute instances (`978b2f91`).
- [ ] Boardgame / Karaoke Favorite: `disabled` while pending is done (`978b2f91`). Still open: add
      cache reducers and drop success-path invalidation.
- [x] Per-row `useState` spinner flags removed (`978b2f91`). Done by deriving pending state from
      `mutation.isPending && mutation.variables?.id === itemId` instead of `useRecyclingState`.
- [x] Drop `isMuted` / `isFavorite` from the `FezChatListItemSwipeable` key and remove the stale
      `SeamailFlatList` comment (`978b2f91`). No ghosting seen on Seamail on 2026-11-13.
- [ ] Panel styles and render panels memoized, public import path, unused `BaseSwipeable` props
      removed, `undefined` for the empty Forum left panel (`978b2f91`). Not confirmed: docstrings
      on every handler.
- [x] Fix the part-way-open stall under system reduced motion (`19f67d2b`).
- [ ] Report the unflushed reduced-motion update upstream (Reanimated / RNGH); drop
      `REDUCED_MOTION_ANIMATION_OPTIONS` once a fixed release ships.
- [ ] Hand-test partial swipes with animations off on the Forum, User, Karaoke and Boardgame lists.
- [ ] Add `accessibilityActions` / `onAccessibilityAction` on swipeable rows; add a non-swipe path
      for Karaoke Favorite.
- [ ] Document swipe actions in Boardgame / Forum / Karaoke help screens; fix `MainHelpScreen`
      "Appearance" -> Accessibility; orientation-neutral wording.

## Verification

- Android physical device: a vertical scroll starting on a row flings; a diagonal scroll does not
  open a row; pull-to-refresh started on a row releases cleanly; swipe a row open, scroll it out of
  view and back, confirm the recycled cell is closed and shows no spinner.
- Reduced motion: with `adb shell settings put global transition_animation_scale 0` and the app
  relaunched, swipe a row part-way (both short of and past half the panel width) and release; it
  must snap closed or open immediately, with no freeze. Repeat with the scale at `1` and confirm
  the normal spring.
- Mutation: favorite on a `?favorite=true` list with the network killed, confirm the row returns;
  favorite then immediately mute on a Forum row, confirm both settle and neither spinner sticks.
- `yarn lint` and `yarn tsc` clean; no `eslint-disable`.

## Upstream references

- RNGH regression: [#4367](https://github.com/software-mansion/react-native-gesture-handler/pull/4367)
  (3.2.0, "[Android] Properly handle `requestDisallowInterceptTouchEvent` for v3").
- Bug report matching this symptom:
  [#4581](https://github.com/software-mansion/react-native-gesture-handler/issues/4581).
- Root-cause fix: [#4582](https://github.com/software-mansion/react-native-gesture-handler/pull/4582)
  (merged 2026-10-12, nightly only); follow-up
  [#4592](https://github.com/software-mansion/react-native-gesture-handler/pull/4592) (open).
- Declined `failOffsetY` prop: [#4563](https://github.com/software-mansion/react-native-gesture-handler/issues/4563),
  [#4564](https://github.com/software-mansion/react-native-gesture-handler/pull/4564).
- Related Android jank report: [#4561](https://github.com/software-mansion/react-native-gesture-handler/issues/4561).
- Config memoization fix in 3.3.0: [#4466](https://github.com/software-mansion/react-native-gesture-handler/pull/4466).
- FlashList recycling guidance: [Recycling](https://github.com/Shopify/flash-list/blob/main/documentation/docs/fundamentals/recycling.md),
  [Performance](https://shopify.github.io/flash-list/docs/fundamentals/performance),
  [Swipeable in FlashList #907](https://github.com/Shopify/flash-list/issues/907).
