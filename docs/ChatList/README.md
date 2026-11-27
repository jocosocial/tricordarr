# ChatList

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

Tuning constants live in `src/Libraries/ChatList/Constants.ts`. Timing is not correctness there: each constant is a spatial threshold, a bound (retry count, pixel tolerance), or a watchdog in milliseconds that logs a warning when it fires. A watchdog warning during a device pass is a bug to chase, not a pass. Don't add a delay or frame count something has to wait out; listen for the event it stands in for. Things that are easy to break:

- `keyExtractor` is required: FlashList's maintain-visible-content-position is a silent no-op without it, and loading older pages would jump the viewport.
- The list only honors its initial position at mount, so screens freeze the initial scroll index and remount via `key` when it becomes known (`FezChatScreen`, `ForumThreadScreenBase`; index math in `src/Libraries/ChatList/InitialScroll.ts`).
- Each chat and forum thread must have its own screen instance, which `getId` on the chat and thread routes in `CommonScreens.tsx` provides. Without it, a notification or link for another chat, tapped while in a chat, only replaced the open screen's params: the frozen index, `readyToShow`, read count and socket de-dupe carried over into the new chat, which opened in the wrong place or crashed FlashList ("index out of bounds, not enough layouts") when the stale index was past its first page. `ChatList` also clamps the anchor index to the loaded items (`clampAnchor`) so a bad index can only cost position. With two chat screens mounted, `SocketProvider`'s `openFezSocket`/`closeFezSocket` must keep a stable identity (they read the socket map through a ref): rebuilt on every map change, they re-ran each screen's socket effect and the two screens closed and reopened each other's sockets in a loop.
- The parent shows an overlay until `onReadyToShow` fires. It always fires (position reached, empty list, or the ready watchdog, which logs a warning; it needs both `READY_WATCHDOG_FRAMES` frames and `READY_WATCHDOG_MS`, because frames alone shrink on a 120Hz display and wall-clock time alone runs out while the JS thread is busy, before the check has measured anything). For an index anchor the ready check also corrects FlashList's estimate-based `initialScrollIndex` landing with plain `scrollToOffset` nudges, and for an end anchor it does the same when the last item is taller than the viewport (`startRenderingFromBottom` only reaches that item's top); don't swap that for `scrollToIndex`, which raced the initial scroll and overshot. After a nudge the check measures again only once a scroll event newer than the nudge has arrived (bounded by `ANCHOR_SCROLL_EVENT_MAX_FRAMES`): measuring sooner reads the old offset, which looks like a nudge that changed nothing and reveals the list early. That was a fixed 3-frame wait, only 25ms at 120Hz. Its first measurement is still a frame count, `ANCHOR_CORRECTION_START_FRAME`; `Constants.ts` explains why that one is safe.
- The list scrolls to the user's own new posts itself (`isOwnItem`); screens must not call `scrollToEnd` after a send.
- Keyboard: the local `KeyboardAvoidingView` resizes the list. `ChatList` re-pins the bottom on any container resize while the user was near the bottom. There are no keyboard listeners: Android used to land one post short after the keyboard closed, which took delayed re-pins after `keyboardDidShow/Hide`, but that was Paper's tab bar resizing the screen again after the keyboard settled, fixed by `keyboardHidesNavigationBar={false}` (see "Keyboard Avoidance" in [Code Notes](<../Code Notes.md>)). A user drag (`onScrollBeginDrag`) cancels any pending re-pin and suppresses new ones until the drag and its fling end. Momentum only counts as the user's when the drag before it was released with velocity (`onScrollEndDrag`'s `velocity`) and no animated scroll of ours started since: Android fires the momentum events for programmatic animated scrolls too, and treating those as the user cancelled the scroll-to-bottom end pin, so scrolling up right after closing the keyboard is not pulled back down. Do not grow this into a multi-frame loop.
- Nothing in a loaded cell may change height when an older page is prepended. FlashList holds the top of the first visible cell still, so a change inside that cell moves the text below it. Fez day dividers are in the separator (rendered in the earlier post's cell) for this reason: in the later post, the oldest loaded post's divider came and went with each page. They also show whenever the chat has unloaded pages, because `postDayCount` only covers loaded posts and crossing its threshold added every divider at once.
- `patches/@shopify+flash-list+2.3.3.patch`: after correcting for a data change, FlashList picked a new anchor in the same pass. With the "Loading previous..." header on screen that was a just-prepended post with an estimated height, and its measurement error moved the content (up to ~65dp). The patch keeps the old anchor until the next pass. The second half of the patch keeps the cells on screen mounted through a prepend: FlashList picked the rows to render from the pre-correction offset, handed the visible posts' cells to the new posts, and so remounted every visible post (images went back to their spinner, galleries lost their sideways scroll). It also kept measured heights by index, so each belonged to the wrong post. The patch moves the measured layouts with the items and keeps the tracked offset on the anchor until the correction lands. Only lists that pass `maintainVisibleContentPosition.anchorThroughDataUpdates` get this (only `ChatList`); every other FlashList keeps stock behaviour. Measured layouts only move with their items when the anchor shifted by exactly the number of added items (a prepend at the head); any other update falls back to FlashList's own relayout. FlashList is pinned to the patched version; see `docs/Dependencies.md` before upgrading.
- Page loading must not depend on scroll events alone. A first page too short to scroll (a few posts at a small page size) gets none, and `startRenderingFromBottom` leaves FlashList's tracked offset outside its start threshold, so `onStartReached` never fires. `ChatList` checks the position once ready and after each page, re-checking with a doubling delay (capped at 30s) in case a load fails or a refetch cancels it. It stops once a check finds nothing to load: away from both edges, scroll events and FlashList's reached callbacks take over. The bottom alignment margin of such a list disappears as it fills, so the end is pinned through that fill. The check uses FlashList's tracked offset and never the last scroll event: FlashList swallows the scroll event of its own prepend correction, so that event still says the list is at the top, and going by it loaded every older page in a row (and left the scroll-to-top button disabled). That button only greys out at the real beginning: while an older page exists it stays enabled, or it would flick off and on as each page loads.
- No spacer in `ListFooterComponent`: FlashList leaves the footer out of its scroll extent (`getMaxScrollOffset`), so `scrollToEnd` from far away landed short and then hopped the footer's height. `ChatList` puts the gap below the last post inside the last cell instead. Horizontal padding goes in `contentContainerStyle`, not `style`, so the scroll indicator stays on the screen edge.
- On Android, an animated `scrollTo` is cancelled wherever it is when the native `maintainVisibleContentPosition` shifts the offset (`scrollToPreservingMomentum` cancels the fling animator). FlashList makes that shift whenever a cell above the viewport measures or a page arrives, which is common right after a fling, so the scroll-to-top button often just stopped the fling. The scroll buttons resend a scroll that ends short of its edge (on momentum end, up to `BUTTON_SCROLL_MAX_RETRIES` times); a touch on the list drops the retry.
- `START_RENDERING_FROM_BOTTOM` in `src/Libraries/ChatList/Constants.ts` is the one-line switch for the fallback that opens at the last item index instead (short chats then top-align).
- Do not add Reanimated `entering`/`exiting`/`layout` animations to chat items (Shopify/flash-list#2052).

## Bi-Directional Chat List Investigation

Report for [#575 Re-investigate bi-directional chat list](https://github.com/jocosocial/tricordarr/issues/575)
and [#567 Explore Sunsetting LegendList](https://github.com/jocosocial/tricordarr/issues/567).
Written 2026-10-14 against `cohoe/re-investigate-bi-directional-chat-list`. Reviewed 2026-11-17 after
merging `main` through `fae23856` (#671): line references, #582 status, and three design points corrected.

This is the investigation spec `ChatList` was built from, kept for its reasoning. It is not
maintained as the code changes: where it disagrees with the code, the code and the sections above
are current. Plans in it that were not built, or were built differently:

- Jump to live (fetching the newest window with an explicit `start`) was not built. `FezChatScreen`
  still fetches the next page proactively whenever one exists.
- `onViewableItemsChanged` is not used. Near-bottom and divider direction come from scroll metrics
  and `getLayout`.
- There is no `'post-with-day-divider'` item type. Fez day dividers render in the separator, so the
  item types are `'post'` and `'post-with-divider'` (see "Nothing in a loaded cell may change height"
  above).
- Own posts are scrolled to by `ChatList` itself (`isOwnItem`), not by a parent `scrollToEnd` call.
- The ready check does not compare `getFirstVisibleIndex()` with the anchor; it measures the anchor's
  offset error and corrects it (`Anchor.ts`).

### TL;DR

- The only chat list still wired to screens is `ConversationListV2` (LegendList) via `FezConversationListV2`
  and `ForumConversationListV2`. `ConversationList` (V1) and `ChatFlatList` are dead code. `ForumPostList`
  (FlashList, top-anchored) is not a chat list and is unaffected.
- `@legendapp/list` is used by exactly three files. Dropping it is a one-component replacement plus deleting
  the two dead files.
- Roughly 60% of `ConversationListV2` is compensation for LegendList: the 8-frame post-`onLoad`
  stabilization loop, the 20-frame keyboard `scrollToEnd` loop, the `extraData` string hack for recycled cells,
  and the estimated-pixel divider math. These are the things we want to stop maintaining.
- FlashList 2.3.x (installed 2.3.2; 2.3.3 is current) now has everything the chat list needs on the new
  architecture: `maintainVisibleContentPosition` with `startRenderingFromBottom` and
  `autoscrollToBottomThreshold`, `onStartReached`, `inverted`, `initialScrollIndex`, a Promise-returning
  `scrollToIndex`, and `getLayout(index)` / `getFirstVisibleIndex()` on the ref.
- Bluesky's `MessagesList.tsx` is a non-inverted raw `FlatList` with `maintainVisibleContentPosition:
  {minIndexForVisible: 0}`, `disableVirtualization`, an opacity-0 reveal gate, and an explicit
  200ms `scrollToOffset(1e7)` burst after send. It is a good reference for *behaviors*, but it never
  anchors to a first-unread index and never unloads history, so it is not a drop-in model for us.
- **Recommendation:** build `ChatList` (V3) on non-inverted FlashList v2, keep the existing domain
  wrappers and screen contracts, gate on a prototype across four scenarios, and keep inverted FlashList as the
  documented fallback. Do not use raw `FlatList` with `disableVirtualization` for Shutternaut-sized threads.
  Details in [Recommendation](#recommendation).

### Environment

| Package | package.json | Installed | Notes |
|---|---|---|---|
| react-native | 0.86.2 | 0.86.2 | New architecture only; FlashList MVCP / `onStartReached` require this |
| @shopify/flash-list | ^2.3.2 | 2.3.2 | 2.3.3 (2026-10-01) is one fix: blank rows at small `drawDistance` (#2510). Still the latest release on 2026-11-17, so none of the open fix PRs cited below have shipped |
| @legendapp/list | ^3.3.3 | 3.3.6 | Used by 3 files |
| react-native-keyboard-controller | 1.21.9 (patched) | | Bluesky is on 1.22.7 |
| react-native-reanimated | 4.5.1 | 4.5.1 | |

Bluesky `social-app` at `a7817e089` (2026-10-14): RN 0.86.3, no FlashList or LegendList, keyboard-controller
1.22.7, reanimated 4.7.1 (patched).

### Current implementations

#### Component inventory

| File | Engine | Status | Consumers |
|---|---|---|---|
| `src/Components/Lists/ConversationListV2.tsx` | LegendList | Live | `FezConversationListV2`, `ForumConversationListV2` |
| `src/Components/Lists/Fez/FezConversationListV2.tsx` | wrapper | Live | `FezChatScreen` (Seamail, LFG, Private Event chat) |
| `src/Components/Lists/Forums/ForumConversationListV2.tsx` | wrapper | Live | `ForumThreadScreenBase` (via `ForumThreadScreen`, `ForumThreadPostScreen`) |
| `src/Components/Lists/ConversationList.tsx` | LegendList | `@deprecated`, dead | only `ChatFlatList` |
| `src/Components/Lists/Fez/ChatFlatList.tsx` | wrapper | dead | none |
| `src/Components/Lists/Forums/ForumPostList.tsx` | FlashList via `AppFlashList` | Live, top-anchored, forward-only | `ForumPostScreenBase`, Pinned, Alertword, `ForumPostSearchBar` |
| `src/Components/Lists/AppFlashList.tsx` | FlashList | Live, generic | ~30 lists/screens |

History (git): RN `inverted` FlatList was added 2023-04 (`6baa3a76`), made optional 2023-11, and removed in
PR #325 (2025-10, `54713e49`) when LegendList arrived. V2 lists landed 2026-02-14 (`76a616b8`,
`9c6fe6a1`). Since then: #254 bidirectional scroll button, #427 local cache mutation, #595 stale divider,
#607 per-screen keyboard avoidance, #610 load-previous scroll bug, #583 up and down scroll buttons together
(`8b5bbddc`, which also had to touch the dead `ConversationList`).

#### `ConversationListV2` anatomy

What it does, and which parts exist only because of LegendList:

| Concern | Mechanism | LegendList-specific? |
|---|---|---|
| Bottom anchoring | `alignItemsAtEnd`, `maintainScrollAtEnd`, `maintainScrollAtEndThreshold={0.1}`, `maintainVisibleContentPosition={true}` | Yes |
| Initial position | `initialScrollIndex` from parent, then `onLoad` → `scrollToEnd` → 8-frame rAF loop re-calling `scrollToEnd` while `onScroll` watches `contentSize.height`; fires `onReadyToShow` when stable (`:281-309, :449-463`) | Yes. Comment: "LegendList's maintainScrollAtEnd is unreliable for dynamic appends" (`:248`) |
| Overlay until positioned | `onReadyToShow` → parent renders absolute `ActivityIndicator` | No (good pattern, keep) |
| Empty data | `useEffect` fires ready because "LegendList does not fire onLoad when data is empty" (`:465-474`) | Yes |
| Live append auto-scroll | render-time compare of `data.length` and first key; `scrollToEnd` in rAF if `isNearBottomRef` (`:248-270`) | Partly. The prepend/append detection via first-key is the #610 fix and is engine-agnostic |
| Near-bottom tracking | `distanceFromBottom <= estimatedItemSize * 1.5` in `onScroll` (`:337`) | No |
| Keyboard | `keyboardWill/DidShow/Hide` listeners → 20-frame rAF loop of `scrollToEnd` (`:171-245`) | Yes, per comment: "maintainVisibleContentPosition didn't fully restore the offset" |
| Scroll buttons (New divider, plus opposite list edge since #583) | `estimatedDividerPosition = newDividerIndex * estimatedItemSize` ("approximate ~100px error") with hysteresis and content-height-delta suppression (`:345-411`) | No, but it is a heuristic because LegendList exposes no `getLayout(index)` |
| Recycled cell staleness | `extraData={\`${isFullyRead}-${newDividerIndex}\`}` in both wrappers (#595) | Yes (`recycleItems`). FlashList recycles too, so some form of `extraData` remains necessary |
| iPad `scrollsToTop={false}` | documented in `Code Notes.md` | No (keep) |

#### Domain wrappers

`FezConversationListV2` owns the read-state model: `effectiveReadCount = initialReadCount ?? members.readCount`,
a one-way `alignAtEndRef` (true → false only, "or the list layout will jump"), a synchronously re-seeded
`initialReadStateRef` on `initialReadCount` change, `newDividerIndex = readCount - paginator.start`, day
`TimeDivider` logic, `maintainScrollAtEnd={true}` always, `estimatedItemSize={100}`.

`ForumConversationListV2` is simpler: `isFullyRead` from route-provided `forumListData` (or `false` when
`startFromPost`), `newDividerIndex` from `forumListData.readCount - forumData.paginator.start`,
`estimatedItemSize={120}`.

Both wrappers are engine-agnostic except for the `LegendListRenderItemProps` import in `ChatFlatList` (dead)
and the `TConversationListV2Ref = LegendListRef` type.

#### Consumer screens

`FezChatScreen` (`src/Screens/Fez/FezChatScreen.tsx`):
- `getInitialScrollIndex` (`:58-68`): `length-1` when read, else `clamp(readCount - paginator.start)`.
  Frozen in a ref and used in `key={\`${fezID}-${initialScrollIndex}\`}` to remount on change.
- Layout: `AppView > ListTitleView … > KeyboardAvoidingView(padding, useKeyboardVerticalOffset) > [View{list+overlay}, ContentPostForm]`.
- Pull-to-refresh `enabled={false}`; refresh only via actions menu.
- Pagination: `usePagination`; plus a proactive `if (hasNextPage) handleLoadNext()` effect (`:235-239`)
  because socket appends only land on the last page.
- Send: `markRead` → `await mutateAsync` → `appendPostToCache(response)` → `resetInitialReadCount()`. **No
  `scrollToEnd` in the screen**; relies on the list's data-grew effect.
- Live: fez socket → de-dupe by `lastProcessedPostIDRef` → `appendPostToCache` (direct cache write, idempotent,
  last page only, bumps `postCount` and `readCount`). Separate notification socket calls `invalidateFez`
  with `refetchType: 'all'` and no "chat is open" guard, so an open chat can be refetched underneath the list.
- `fezPostsData` is `pages.flatMap(...)` with no de-dupe (forum side de-dupes in `useForumData`).

`ForumThreadScreenBase` (`src/Screens/Forum/Thread/ForumThreadScreenBase.tsx`):
- `getInitialScrollIndex()` recomputed every render, not frozen, no `key` (`:292-309, :357`). Comment says
  it avoids `scrollToEnd` because it "fires before LegendList has fully laid out".
- After send: `appendPost` → `markReadMutation` → `flatListRef.current?.scrollToEnd({animated:false})`
  (`:269`, rAF wrapper commented out).
- No socket; other users' posts arrive only via refetch.
- `fullRefresh` also calls `fetchNextPage()` because "the server may report more posts than we have pages for".

#### Pagination & server contract

- `useTokenAuthPaginationQuery`, `limit = defaultPageSize = 50`, `start` omitted on first fetch so the server
  picks the window.
- Swiftarr fez: `defaultStart = ((readCount - 1) / limit) * limit` (`FezController.swift:1436`). Forum:
  default start from `lastPostReadID`, rounded down to a multiple of `limit` (`ForumController.swift:1774-1777`).
  So `getPreviousPageParam`'s `prevStart >= 0` test is safe for the default window.
- **Not safe for `?startPost=`**: in that branch `start` is the exact count of earlier posts and is *not*
  rounded (`ForumController.swift:1766-1769`). With `start=37, limit=50`, `prevStart=-13` →
  `hasPreviousPage=false` and posts 0–36 can never be loaded from `ForumThreadPostScreen`. Fix in
  `src/Queries/Pagination.ts:39-40` (adjacent to this work, not a list-engine issue): return `undefined`
  when `start <= 0`, else `prevStart < 0 ? {start: 0, limit: start} : {start: prevStart, limit}`. The
  `start <= 0` guard must come first; without it a page at `start=0` yields `{start: 0, limit: 0}`,
  `hasPreviousPage` never goes false, and the list refetches an empty page forever.
- `usePagination` guards on the previous render's `isFetching*` flags only; no in-flight ref.

#### Keyboard

Per `docs/Code Notes.md` and PR #607: no global KAV; chat screens wrap list and `ContentPostForm` as flex
siblings in a local `KeyboardAvoidingView` (`behavior='padding'`, `useKeyboardVerticalOffset`).
`KeyboardStickyView` / `KeyboardAwareLegendList` / `useKeyboardChatComposerInset` are confirmed broken for a
composer above the bottom tab bar (translateY assumes flush-with-screen-bottom). Bluesky avoids this only
because its chat runs with `minimalShell` (no tab bar). `AppView.tsx:35-36` still has a stale comment
claiming chat screens use `KeyboardAwareLegendList`.

### Known issues

#### Fixed / closed

| Issue | Summary | Resolution |
|---|---|---|
| [#112](https://github.com/jocosocial/tricordarr/issues/112) | Investigate FlashList | Adopted 2024-08 for schedule; now ~30 lists |
| [#254](https://github.com/jocosocial/tricordarr/issues/254) | Scroll to latest unread | Divider-aware bidirectional FAB (`e63a1b82`) |
| [#281](https://github.com/jocosocial/tricordarr/issues/281) | Long photostream crash | FlashList + RN upgrades |
| [#359](https://github.com/jocosocial/tricordarr/issues/359) | Seamail scroll weird, keyboard | V2 rewrite (2026-02) |
| [#365](https://github.com/jocosocial/tricordarr/issues/365) | No New divider on live msgs | V2 |
| [#368](https://github.com/jocosocial/tricordarr/issues/368) | Position vs loading images (forums) | V2 |
| [#369](https://github.com/jocosocial/tricordarr/issues/369) | Jump to bottom leaves blank items | V2; "likely an item recycling issue" |
| [#372](https://github.com/jocosocial/tricordarr/issues/372) | Image-heavy thread perf | V2 |
| [#420](https://github.com/jocosocial/tricordarr/issues/420) | Items blank until slight scroll | Not seen since RN86 |
| [#421](https://github.com/jocosocial/tricordarr/issues/421) | V2 keyboard open/close breaks position (Android) | 20-frame rAF loop in V2 |
| [#440](https://github.com/jocosocial/tricordarr/issues/440) | Load-previous scrolled to bottom with small pages | #610 first-key prepend detection |
| [#500](https://github.com/jocosocial/tricordarr/issues/500) | Posting didn't clear New divider | #595 `extraData` + `resetInitialReadCount` |
| [#535](https://github.com/jocosocial/tricordarr/issues/535) | Swipe-up-from-bottom to refresh | Closed not-planned: only free on a real `inverted` list |
| [#573](https://github.com/jocosocial/tricordarr/issues/573) | Keyboard avoiding analysis | #607 per-screen KAV; sticky-view approach rejected |
| [#614](https://github.com/jocosocial/tricordarr/issues/614) | markRead without full refetch | mutation added |
| [#582](https://github.com/jocosocial/tricordarr/issues/582) | Both up and down scroll buttons on bidirectional lists | #583 `FloatingScrollButtonsView` in `ConversationListV2` (`8b5bbddc`) |

#### Open

| Issue | Relevance |
|---|---|
| [#575](https://github.com/jocosocial/tricordarr/issues/575) | This report |
| [#567](https://github.com/jocosocial/tricordarr/issues/567) | Sunset LegendList; notes FlashList `inverted` + Android left scrollbar |
| [#506](https://github.com/jocosocial/tricordarr/issues/506) | Forum images glitchy, "greatly improved by RN86+FlashList, not solved". Image height settling after render is the classic MVCP stressor |
| [#530](https://github.com/jocosocial/tricordarr/issues/530), [#556](https://github.com/jocosocial/tricordarr/issues/556) | Unified LFG list, tablet — indirect |

#### Sharp edges documented in code comments

- `ConversationListV2.tsx:248` LegendList `maintainScrollAtEnd` unreliable for appends.
- `ConversationListV2.tsx:179-200` keyboard offset not restored by MVCP; Android KAV animates over frames.
- `ConversationListV2.tsx:350` divider position is estimated, "~100px error".
- `ConversationListV2.tsx:369-401` hysteresis + content-height-delta suppression against FAB flicker from recycling.
- `ConversationListV2.tsx:465` LegendList never fires `onLoad` with empty data.
- `FezConversationListV2.tsx:104` `alignItemsAtEnd` must never flip back to true "or the list layout will jump".
- `FezConversationListV2.tsx:185-192`, `ForumConversationListV2.tsx:156-163` recycled cells keep stale dividers without `extraData`.
- `ForumThreadScreenBase.tsx:84` `@TODO test that this doesn't jump around, especially with the "thread from post"`.
- `ForumThreadScreenBase.tsx:300` avoid `scrollToEnd` because it fires before LegendList lays out.
- `FezChatScreen.tsx:235-239` `onEndReached` doesn't fire when socket pushes past a page boundary.
- `ChatFlatList.tsx:31` `@TODO test loading a seamail with tons of unread messages` (dead file, but the scenario is still untested).
- `useFezCacheReducer.ts:883` `TODO: derive the intended data from the socket payload` (`invalidateFez` is a blunt refetch).
- `AppView.tsx:35-36` stale keyboard comment.

#### Test coverage

Only `tests/UnreadCounts.test.ts` touches this area. No tests for `usePagination`, `getPrevious/NextPageParam`,
cache reducers, `getInitialScrollIndex`, or any list component. Maestro `ForumPostReply.yaml` opens a thread
but does not scroll. The `conversationListScroll-button` and `conversationListSecondaryScroll-button` testIDs are unreferenced. `docs/Testing.md`: CI runs
typecheck and lint only.

### Requirements

1. Long chats (Shutternaut-scale forums with many images; seamails with thousands of posts). Must virtualize.
2. Start at bottom when fully read; start at first unread (New divider) otherwise; start at a given post
   (`startPost`) for forums.
3. Paginate older (up) and newer (down) without the viewport jumping; small page sizes must not auto-scroll
   to bottom on prepend (#440).
4. Live appends (socket, own send) auto-scroll only when the user is near the bottom; own send always lands
   at bottom; New divider clears after own send (#500) and appears for live posts (#365).
5. Keyboard show/hide keeps the bottom pinned when the user was at the bottom; composer above the bottom tab bar.
6. Floating scroll buttons: to New divider (direction-aware) or to bottom, plus the opposite list edge, both
   shown together with up above down (#582, shipped in #583; `ChatList` must not regress it).
7. Images and variable-height items settling must not displace the viewport (#368, #506).
8. Empty chat, 1-message chat, and chat shorter than the viewport must all render and hide the overlay.
9. Android and iOS parity; tablets.
10. Drop `@legendapp/list`.

### Options

#### A. FlashList v2, non-inverted, MVCP `startRenderingFromBottom`

Data oldest→newest (as today). `maintainVisibleContentPosition={{startRenderingFromBottom: isFullyRead,
autoscrollToBottomThreshold: followTail ? 0.2 : undefined, animateAutoScrollToBottom: true}}`,
`onStartReached` loads previous, `onEndReached` loads next, `initialScrollIndex` for the unread/startPost case.

FlashList 2.3.2 facts (from `node_modules/@shopify/flash-list/src`):
- MVCP is **on by default** on new arch and requires `keyExtractor` (silently no-op without it). Prepend
  anchoring tracks the first visible item by key and `scrollBy`s the diff (`useRecyclerViewController.tsx:92-212`).
- `autoscrollToBottomThreshold` sets a sticky "pending" flag in bound detection and calls native
  `scrollToEnd` on data change or window resize (`useBoundDetection.ts:67-187`). Keyboard-induced resize
  triggers it. FlashList computes near-bottom against the threshold itself, so the caller does not need to
  gate the prop on its own near-bottom state. In 2.3.2 a second effect also re-runs the check when content
  height changes (`useBoundDetection.ts:178-187`, skipped within 100ms of a bounds check), so item size
  changes can re-pin the bottom. #1666 / #1903 (maintainer: call `scrollToEnd` yourself) predate that
  effect; whether it is enough after a send is a prototype question, since the flag is consumed on each run
  and only re-armed by the next bounds check.
- `startRenderingFromBottom` → `getInitialScrollIndex()` returns `length-1` when no `initialScrollIndex`
  (`RecyclerViewManager.ts:332-339`), and pads short content to the bottom (`RecyclerView.tsx:499-508`).
  Only applies if `data.length > 0` at mount. So the flag is `initialScrollIndex={length - 1}` plus the
  short-content padding, which is where #2050 / #2070 live.
- `onStartReached` default threshold 0.2, edge-triggered, **`pendingStartReached` not reset on data change**
  → stops firing after several prepends (#1785, fix PR #2429 open). The flag does clear on the next bounds
  check once MVCP has shifted the offset past the threshold, so this should only bite when a prepend adds
  less than 0.2 of a viewport. Both callbacks can fire on mount for short lists (#1671).
- `initialScrollIndex` applied once after first layout, two `scrollToOffset`s, `isInitialScrollComplete` at
  100ms. Unmeasured items estimated at ~200px, so lands wrong for tall items (#2307, #2526, fix PR #2444 open).
- `scrollToIndex` returns a Promise, steps through layouts, disables offset correction for 200-300ms.
- `onLoad` fires once after first layout + rAF; it is **not** "initial scroll done".
- Ref exposes `getLayout(index)`, `getFirstVisibleIndex()`, `getAbsoluteLastScrollOffset()`,
  `getChildContainerDimensions()` — replaces V2's estimated divider pixel math.
- Recycling always on (`maxItemsInRecyclePool={0}` disables pool); `useRecyclingState` exported.

Upstream P1s to plan around: #2018 (jump when prepending variable-height items), #2050 (jump when initial data
doesn't fill screen with `startRenderingFromBottom`), #2070 (flicker: bottom item renders first),
#1998/#1915 (`startRenderingFromBottom` glitchy/slow on Android), #1951 (bottom items not rendered with
variable heights; raise `drawDistance`), #2399 (Android view flattening loses `contentContainerStyle` padding),
#2026/#2066 (iOS keyboard double-scroll with `autoscrollToBottomThreshold`).

Pros: same data orientation as today; wrappers unchanged; no transform; scrollbar correct; a11y order correct;
header/footer semantics normal; same engine as the other 30 lists; ref APIs enable exact divider targeting.
Cons: the P1 list above is real and mostly in exactly our scenarios; `startRenderingFromBottom` + short data
is the weakest spot; `onStartReached` bug needs a client-side nudge as a guard.

#### B. FlashList v2, `inverted`

Data newest→oldest. Offset 0 is the bottom, so start-at-bottom is free and needs no MVCP bottom logic.
`onEndReached` = older, `onStartReached` = newer. `ListFooterComponent` is the visual top.

Facts: Android uses `rotate: 180deg` (scrollbar on the left, #2524; fix PR #2308 open), TalkBack order
reversed (#2381), `ItemSeparatorComponent` leading/trailing swapped (#2301/#2438/#2441 open), refresh control
not counter-flipped and bottom pull-to-refresh unsupported (#2019), `checkBounds` not inversion-aware,
`autoscrollToBottomThreshold` would scroll toward the *oldest* end so tail-follow must be hand-rolled or
mapped to `autoscrollToTopThreshold` (unverified). `startPost` / first-unread still needs `initialScrollIndex`
with reversed index math; `readCount - start` becomes `length - 1 - (readCount - start)` and the
`TimeDivider` day-boundary logic flips. Official fixture `fixture/react-native/src/ChatInverted.tsx` exists.

Pros: bottom start is trivially correct; short-content bottom alignment is free; pull-from-bottom becomes
possible later (#535). Cons: Android scrollbar and a11y regressions today; every index/day-divider computation
in both wrappers reverses; separators broken upstream; we'd be the odd list out.

#### C. Raw `FlatList`, Bluesky style

Non-inverted `Animated.FlatList`, `maintainVisibleContentPosition={{minIndexForVisible: 0}}`,
`disableVirtualization`, `removeClippedSubviews={false}`, `initialNumToRender` ≥ page size, opacity-0 until
first `onContentSizeChange` → `scrollToOffset({offset: height})`, `isAtBottom` as `contentSize.height - 100 <
offset + layoutHeight`, send → 200ms rAF burst of `scrollToOffset({offset: 1e7})` (not `scrollToEnd`, which
lands short with keyboard open; not `MAX_SAFE_INTEGER`, which overflows Android int32), reveal fallback effect
so a dedupe'd firehose message can't leave the list hidden forever, `onStartReached` for history with cursor
trust and Map-based dedupe.

Facts (RN 0.86): FlatList MVCP supports only `minIndexForVisible` and `autoscrollToTopThreshold`; no
bottom-autoscroll; `inverted` still a `{scale: -1}` transform on Android; `onStartReached` exists with
content-length dedupe. Bluesky never anchors to first-unread, never unloads history, and acknowledges
unbounded row growth. `List.tsx` silently overrides their `scrollEventThrottle` to 1.

Pros: most battle-tested behaviors; no third-party engine; we already know RN's MVCP semantics from the 2023
inverted era. Cons: `disableVirtualization` is a non-starter for Shutternaut threads (#372, #281); with
virtualization on, FlatList's blank-cell and `scrollToIndex`-without-`getItemLayout` problems return; no
`autoscrollToBottomThreshold`, so tail-follow is manual (which Bluesky does anyway); introduces a second list
engine in the app.

#### D. Keep LegendList

Zero migration cost, but the stabilization/keyboard/extraData scaffolding stays, `onLoad` isn't a positioning
signal, no `getLayout`, and it's a second engine. Rejected per #567.

#### Requirement matrix

| Req | A FlashList non-inverted | B FlashList inverted | C FlatList (Bluesky) | D LegendList |
|---|---|---|---|---|
| 1 Long chats | ✓ recycling | ✓ recycling | ✗ with `disableVirtualization`; ~ without | ✓ |
| 2a Start at bottom | ~ `startRenderingFromBottom` (#2050/#2070/#1998) | ✓ free | ~ content-size scroll + reveal gate | ~ (today's loop) |
| 2b Start at unread/startPost | ✓ `initialScrollIndex` (~200px estimate caveat) | ~ reversed index math | ~ `scrollToIndex` without layout | ✓ |
| 3 Bi-dir paging stable | ✓ MVCP by key; #1785 nudge needed | ✓ | ✓ RN MVCP (prepend only) | ✓ (after #610) |
| 4 Live tail-follow | ✓ `autoscrollToBottomThreshold` (size changes: verify in prototype) | ✗ hand-rolled | manual burst | ~ (today's supplement) |
| 5 Keyboard pin | ~ resize triggers autoscroll; iOS double-scroll #2026 | manual | manual burst | ~ 20-frame loop |
| 6 Scroll buttons | ✓ `getLayout`/`scrollToIndex` Promise | ✓ | ~ no layout API | ✗ estimated |
| 7 Image settle | MVCP anchors first visible key | same | RN MVCP | similar |
| 8 Empty/short | needs explicit handling (`data.length>0` at mount) | ✓ | ✓ | ✗ `onLoad` never fires |
| 9 Android/a11y | ✓ | ✗ left scrollbar, TalkBack reversed | ✓ | ✓ |
| 10 Drop LegendList | ✓ | ✓ | ✓ | ✗ |

### Recommendation

**Primary: Option A.** Build `src/Components/Lists/ChatList.tsx` on FlashList v2, non-inverted, keeping the
`ConversationListV2` prop contract so `FezConversationListV2`, `ForumConversationListV2`, `FezChatScreen`, and
`ForumThreadScreenBase` change minimally. If the prototype fails scenario 1 or 4 below on Android, the
**first fallback** stays on Option A: drop `startRenderingFromBottom`, pass `initialScrollIndex={length - 1}`
from the parent (what `ForumThreadScreenBase` already does), and top-align chats shorter than the viewport.
**Last resort: Option B**, because it reverses every index and day-divider computation in both wrappers.
Treat Bluesky as a behaviors checklist, not an engine choice.

#### `ChatList` design

Props: same as `ConversationListV2` minus `alignItemsAtEnd`/`maintainScrollAtEnd` (replaced by
`anchor: 'end' | {index: number}`), plus `followTail?: boolean` (default `anchor === 'end'`),
`getItemType?`, and `extraData`. Ref type becomes `FlashListRef<TItem>`.

Internals:
- `maintainVisibleContentPosition` memoized: `{startRenderingFromBottom: anchor === 'end',
  autoscrollToBottomThreshold: followTail && !hasNextPage ? 0.2 : undefined, animateAutoScrollToBottom: true}`.
  Do not also gate the threshold on our own `isNearBottom`: FlashList already checks near-bottom against
  it, and driving the prop from scroll state rebuilds the config on scroll and races a post that arrives
  before the state settles. The threshold is `undefined` while `hasNextPage` is true: `scrollToEnd` goes to
  the end of the *loaded* window, and following a tail that isn't the real tail is wrong. Jumping to live
  should fetch the newest window rather than `scrollToEnd` — this also addresses the `FezChatScreen`
  proactive `handleLoadNext` effect. A plain reset of the infinite query is not enough: it omits `start`,
  so the server picks the window from the read position, which is the tail only when read state is
  current. Request `start = floor((total - 1) / limit) * limit` explicitly.
- `initialScrollIndex={anchor.index}` with `initialScrollIndexParams={{viewOffset}}` so the New divider sits
  below the top edge. Keep the parent-side `key={…-initialScrollIndex}` remount pattern from `FezChatScreen`
  and **add it to `ForumThreadScreenBase`**, which currently recomputes the index every render.
- Ready signal: for `anchor: 'end'`, fire `onReadyToShow` when `onLoad` has fired **and**
  `getAbsoluteLastScrollOffset() + windowHeight >= childContainerHeight - epsilon` (or after a bounded number
  of frames); for `anchor.index`, when `onLoad` fired and `getFirstVisibleIndex()` is within ±1 of the index.
  Keep a bounded fallback like Bluesky's APP-2238 reveal so the overlay cannot stick. Empty data: unlike
  LegendList, FlashList's first-layout check is `visibleIndices.every(measured)`, which is `true` for an empty
  array (`RecyclerViewManager.ts:412-420`), so `onLoad` fires; keep V2's explicit `data.length === 0` fire
  anyway as a cheap guard.
- Near-bottom: keep `isNearBottomRef` from `onScroll`, but also feed `onViewableItemsChanged` so "divider
  visible" and "last item visible" are exact rather than pixel estimates.
- Scroll buttons: `getLayout(newDividerIndex)` vs `getAbsoluteLastScrollOffset()` for direction; `await
  scrollToIndex({index, viewPosition: 0.1})`. This deletes the hysteresis/content-height-delta code. Keep
  the #583 behavior: primary and secondary actions rendered through `FloatingScrollButtonsView`, up above
  down, same testIDs.
- Own send: parent calls `listRef.current?.scrollToEnd({animated: true})` after `appendPostToCache`. Do this
  in **both** screens (today `FezChatScreen` relies on the list's data-grew heuristic). Start with that
  single call: 2.3.2 re-runs the autoscroll check on content height changes, which may cover the composer
  collapsing and the new tall item measuring. Only if the prototype lands short, add a Bluesky-style short
  bounded rAF burst. Prefer `scrollToEnd` over `1e7` offsets since FlashList's `scrollToEnd` first ensures
  the last index is engaged.
- Keyboard: start with **no** list-side keyboard code. FlashList's bound detection re-runs on window resize,
  and the KAV `padding` resize is a window resize. If iOS double-scroll (#2026) or Android under-scroll
  reproduces, reinstate a `keyboardDidShow/Hide` → single `scrollToEnd` (not a 20-frame loop) gated on
  `isNearBottomRef`.
- `onStartReached` #1785 nudge: in `onScroll`, when `contentOffset.y < threshold && hasPreviousPage &&
  !isFetchingPreviousPage`, call `handleLoadPrevious()` directly. `usePagination` already guards on
  `isFetchingPreviousPage`. Consider adding an in-flight ref there too. This is a guard for the
  small-prepend case, not something the design depends on; scenario 2 is where it would show.
- Prepend protection: FlashList's MVCP already does this by key; keep the #610 first-key comparison only to
  decide whether an append should trigger a send-scroll, not for position.
- `drawDistance`: raise above the default 250 for image-heavy forums (#1951) and measure.
- `getItemType`: `'post'` vs `'post-with-divider'` vs `'post-with-day-divider'` so recycled cells don't carry
  divider chrome between types; keep `extraData={\`${isFullyRead}-${newDividerIndex}\`}` because recycling
  still applies.
- `scrollsToTop={false}` (iPad, see Code Notes). Also audit `AppFlashList`, which still uses the default.
- Avoid Reanimated layout animations on items (#2052) — check `FezPostListItem` / `ForumPostListItem` and
  `BaseSwipeable` for `entering`/`layout` props.

#### Scenario gate for the prototype

Run on an iOS simulator and an Android emulator before replacing V2:

1. Fully-read seamail with 300+ posts, `defaultPageSize` 50: opens at bottom, no flash of top content,
   overlay hides, scroll up loads previous twice, no jump, scroll button appears/disappears correctly.
2. Same with `defaultPageSize` 5 (reproduces #440): loading previous must not scroll to bottom.
3. Seamail with 20 unread across a page boundary: opens at New divider with the divider visible below the
   top edge, primary scroll button points down and scrolls to bottom, secondary scrolls to the top, divider
   clears after sending.
4. Short chat (2 messages) and empty chat: bottom-aligned (top-aligned under the first fallback), overlay
   hides, send works.
5. Live: second device/account posts while chat is open at bottom → auto-scroll; while scrolled up → no
   scroll, FAB shows; `invalidateFez` refetch underneath does not move the viewport.
6. Keyboard open/close at bottom (iOS and Android): last message stays flush with the composer.
7. Shutternaut-scale forum thread with images: open at unread, scroll both directions, no blank cells, no
   ping-pong as images settle (#506).
8. `ForumThreadPostScreen` (`startPost`): opens at the post; loading previous reaches post 0 (requires the
   `Pagination.ts` fix).
9. Tablet.

#### Migration steps

1. Upgrade `@shopify/flash-list` to 2.3.3 (one fix, low risk). Note `Known Issues.md` expo-doctor mismatch.
2. Delete `ConversationList.tsx` and `Fez/ChatFlatList.tsx` (dead).
3. Add `ChatList.tsx`; switch `TConversationListV2Ref` to `FlashListRef`; update both wrappers' `renderItem`
   prop types (`ListRenderItem` from FlashList) and the two screens' refs.
4. Fix `getPreviousPageParam` for unaligned `start`, with the `start <= 0` guard.
5. Freeze/`key` the initial scroll index in `ForumThreadScreenBase`.
6. Add explicit `scrollToEnd` after send in `FezChatScreen`.
7. Remove `@legendapp/list` from `package.json`; grep docs (`Code Notes.md`, `AGENTS.md`/`CLAUDE.md` keyboard
   section still names `KeyboardAwareLegendList`), fix `AppView.tsx:35-36` comment.
8. Add unit tests for `getInitialScrollIndex`, `getPrevious/NextPageParam`, and a Maestro flow that opens a
   seamail and asserts the last post is visible.

#### Adjacent findings (not blocking, worth tickets)

- `getPreviousPageParam` strands posts for `?startPost=` (above).
- `ios/Podfile.lock` picks up a `hermes-engine` checksum change on `pod install` after the #671 merge.
- `invalidateFez` has no "chat is open" guard; `useFezCacheReducer.ts:883` TODO.
- `FezChatScreen` flattens pages without de-dupe; `useForumData` does. Unify.
- `ForumPostPinnedScreen` passes `refreshing={isFetching}` directly to `AppRefreshControl` (against the
  RefreshControl rule).
- `AppFlashList` lacks `scrollsToTop={false}` (iPad header-tap issue documented in Code Notes).
- `docs/Testing.md` reports 5 unit tests failing on clean checkout.

### Sources

- Tricordarr: files cited inline; `gh issue view` for #112, #254, #281, #332, #359, #365, #368, #369, #372,
  #420, #421, #500, #506, #535, #567, #575, #582, #614; PRs #325, #333, #427, #583, #595, #607, #610.
- FlashList 2.3.2 source in `node_modules/@shopify/flash-list/src` (`FlashListProps.ts`, `FlashListRef.ts`,
  `hooks/useBoundDetection.ts`, `hooks/useRecyclerViewController.tsx`, `RecyclerView.tsx`,
  `RecyclerViewManager.ts`, `native/config/PlatformHelper.*`); Shopify/flash-list releases v2.2.3–v2.3.3,
  PR #2131, issues #1666, #1671, #1785, #1903, #1915, #1951, #1998, #2018, #2019, #2026, #2050, #2052, #2066,
  #2070, #2086, #2307, #2381, #2399, #2517, #2524, #2526, PRs #2300, #2301, #2308, #2383, #2429, #2438,
  #2441, #2444, #2516; `documentation/docs/fundamentals/usage.md`, `known-issues.md`,
  `fixture/react-native/src/ChatInverted.tsx`.
- RN 0.86.2: `Libraries/Components/ScrollView/ScrollView.js:502-528`, `@react-native/virtualized-lists`
  `VirtualizedList.js:927-931, 1569-1604, 2037-2041`.
- Bluesky `~/Projects/public/social-app` @ `a7817e089`: `src/screens/Messages/components/MessagesList.tsx`,
  `Conversation.tsx`, `MessageComposer.tsx`, `components/vendor/KeyboardStickyView.tsx`,
  `src/view/com/util/List.tsx`, `src/state/messages/convo/agent.ts`,
  `src/features/followingV2/home/anchorCorrection.ts`.
- Swiftarr `~/Projects/jocosocial/swiftarr` @ `07bfaddf`: `FezController.swift:323-332, 1433-1436`,
  `ForumController.swift:666, 1764-1781`. At `24b23cfc` (2026-11-14) the `startPost` logic is unchanged
  but sits at `ForumController.swift:1868-1880`.
