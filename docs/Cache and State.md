# Cache and State

Everything about how the React Query cache is written to by hand: how a cache reducer is built, when
to apply a change optimistically, how a control behaves while its mutation is in flight, and the one
narrow case where invalidation is the right tool.

The short version:

- The query cache **is** the app's shared state. There is no separate store.
- A mutation's effect on that cache is applied by a **cache reducer** — named functions that
  transform cached pages — not by refetching.
- Apply the change **before** the request when you can compute it locally; roll back in `onError`.
- **Invalidation is an escape hatch**, not a write path.

## Writing a cache reducer

Reducers live at `src/Hooks/<Domain>/use<Domain>CacheReducer.ts`, one per entity family:
`useEventCacheReducer`, `useFezCacheReducer`, `useForumCacheReducer`, `usePerformerCacheReducer`,
`usePhotostreamCacheReducer`, `useUserCacheReducer`.

**Shape.** A reducer is a hook returning named actions — `updateFavorite`, `appendPost`,
`prependImage`, `markRead`. No `useState`, no `useReducer`, no local copy of server data: each
action reads and writes the query cache directly through `setQueryData` / `setQueriesData` and
returns new objects so React Query re-renders. Wrap each action in `useCallback` so memoized
children aren't invalidated on every render. Actions stay **synchronous** — callers treat them as
cache writes, so anything async (`cancelQueries`) is fired without awaiting.

Name actions for what the user did, not for the endpoint that did it. Several actions are shared by
a menu item, a swipeable and a detail screen; the name has to make sense at all three.

### Page helpers

Never hand-roll page traversal. `src/Libraries/CacheReduction.ts` has the generic helpers, all built
around a `PageItemAccessor<TPage, TItem>` (`get`/`set` pair) so one implementation covers every page
shape:

| Helper                                       | Use                                                                          |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| `updateItemsInPages`                         | Map an updater over every item in every page (the usual "flip a flag" case). |
| `filterItemsFromPages`                       | Remove items matching a predicate.                                           |
| `findInPages`                                | Check whether an item is already present — guard before inserting.           |
| `insertAtEdge`                               | Prepend to the first page or append to the last.                             |
| `moveItemToEdge`                             | Remove, then re-insert at an edge (a bumped thread, a chat with a new post). |
| `sortedInsertIntoPages` / `sortItemsInPages` | Keep a time-ordered list ordered after a write.                              |
| `paginatedHighWaterMark`                     | How far a paginated list has actually been read (drives mark-read).          |

Define the accessor once at module scope next to the key prefix, as
`usePhotostreamCacheReducer.ts` does.

### Decide which caches a write touches

This is where the bugs are. A single entity appears in many cached queries that differ only by their
params, and the params live at `queryKey[1]`. A write has to be judged against each cached query
individually — `setQueriesData` over a bare prefix will drop the entity into caches it doesn't
belong in.

```ts
for (const query of queryClient.getQueryCache().findAll({queryKey: [LIST_KEY]})) {
  const params = query.queryKey[1] as Record<string, unknown> | undefined;
  if (!paramsIncludeThisEntity(params, entity)) {
    continue;
  }
  queryClient.setQueryData(query.queryKey, oldData => /* ... */);
}
```

Removals are the exception: a deleted item is gone from every scope, so `removeImage` applies
universally with no predicate.

### Filter params can make a cache a membership set

A param like `?favorite=true` or `?onlynew=true` does not merely describe the rows — it **defines
which rows belong at all**. An update that clears the flag has to _remove_ the entity from that
cache, and an insert has to check the flag before adding.

`useFezCacheReducer` keeps this in one predicate:

```ts
/** True if the list cache (query params) is a favorites-only cache (?favorite=true). */
function listParamsAreFavoritesOnly(params: Record<string, unknown> | undefined): boolean { ... }

const favoriteMatch = !listParamsAreFavoritesOnly(params) || !!fez.members?.isFavorite;
```

Every action that inserts into or updates a list cache needs that clause. Missing it on one inserter
is exactly how a brand-new, unfavorited chat ended up at the top of a "Favorites" list.

### Paginator bookkeeping

The page helpers touch only the item array. `paginator.start` / `limit` / `total` are left alone,
and `getNextPageParam` (`src/Queries/Pagination.ts`) computes the next request's `start` from the
server's paginator. Insert an item without adjusting `total` and the next page re-fetches a row the
first page already holds, which surfaces as a duplicate key in the list.

If the endpoint paginates for the current user, either adjust the paginator alongside the insert or
accept that the list is only correct until the next refetch — and say which in a comment.

### `cancelQueries` only where there is data

A refetch already in flight when the user taps will resolve _after_ the optimistic write and stomp
it. The reducers therefore cancel before writing — but a cancel must be scoped to caches that
actually hold data:

```ts
queryClient.cancelQueries({
  queryKey: [LIST_KEY],
  predicate: query => query.state.data !== undefined,
});
```

A query with no data yet is an **initial load**, not a stale refetch. Cancelling it aborts the only
request that would ever fill that screen, and the optimistic write then no-ops because there is
nothing to patch — leaving an empty list that never recovers.

## Mutation In-Flight State (double-submit prevention)

The app runs on a cruise-ship network: high latency, jitter, occasional packet loss. Any window where a Post/Send/Save control is tappable while its write is still in flight becomes a duplicate write on that network, because the user reasonably assumes a non-spinning button means nothing happened. See #533 ("Forum/Fez Posting Stopped Spinning Too Early") for the incident that prompted this.

Two failure shapes, two different fixes:

**Formik forms.** Formik only lets the _consumer_ own `isSubmitting` when `onSubmit` returns `undefined`. If `onSubmit` is `async`, it always returns a Promise, and Formik clears `isSubmitting` itself as soon as that Promise resolves — not when the network request completes. `ContentPostForm`'s wrapper was `async` but fired `mutation.mutate()` without awaiting it, so the returned promise resolved a microtask after the mutation was merely _started_, re-enabling the button mid-request.

- If your submit handler is `async` (or calls one), it MUST `await mutation.mutateAsync(...)`, not call `mutation.mutate(...)` and return.
- Prefer this over `mutation.mutate()` + `onSettled: () => setSubmitting(false)`. That pattern only works if the handler is fully synchronous; it silently breaks the moment someone adds an `await` above the mutation call (e.g. to save a photo first), and nothing catches the regression short of tapping the button on a slow network.
- Catch mutation rejections inside the handler (`useTokenAuthMutation`/`usePublicMutation` already raise the error snackbar via `onError`) so the rejection doesn't escape into Formik's submit handling.

**Non-Formik controls** (menu items, swipeables, header buttons, anything driving `mutation.mutate()` directly). Formik isn't involved, so there's no default protection at all — you must explicitly disable the control while the mutation is in flight:

- Single mutation: `disabled={mutation.isPending}` on the pressable (`Menu.Item`, `PrimaryActionButton`, etc). `SubmitIconButton` already does this internally via its `submitting` prop.
- Menus specifically: a `Menu.Item`'s parent menu stays open until `onSettled` calls `closeMenu()` (per `AGENTS.md`'s Menus convention), so the item itself needs `disabled`, not just a loading icon — a loading icon alone (`getStateLoadingIcon`) is decorative and does not block a second tap.
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

**Menus keep closing on `onSettled`, not on tap.** This was considered and decided, not overlooked. An optimistic menu item still holds the menu open for the whole round trip, which means the visible win lands on the list underneath rather than in the menu itself. Closing on tap would be the larger UX win, and `AGENTS.md`'s filter-item rule (pick a filter, menu dismisses) arguably already points that way for a favorite/mute item. We're staying with `onSettled` anyway, because:

- the open menu is where a rollback is legible — the row the user tapped visibly reverts, instead of a snackbar appearing over a screen where something silently un-changed;
- it's the only in-flight feedback these items have (`getStateLoadingIcon` on the row);
- one unconditional rule ("mutating items close in `onSettled`") beats a rule with an "unless it's optimistic" carve-out that every future menu-item author has to evaluate.

A mutating toggle (favorite/mute/pin) counts as a **mutating item** under `AGENTS.md`'s Menus section, not a filter item — that ambiguity is what makes this worth stating. If we ever revisit, the follow-up order is: fix the in-flight `disabled` gaps first, then rewrite the Menus rules around "can you compute the new value locally", then convert — with verification aimed squarely at the forced-failure path.

**`cancelQueries` before the optimistic write.** TanStack's optimistic-update recipe starts with `queryClient.cancelQueries(...)` for a reason: a refetch that was already in flight when the user tapped will resolve _after_ our optimistic write and stomp it back to the stale value — the same flicker this pattern exists to remove, on the same slow network that makes the window wide. Rather than asking every call site to remember this, the cancel is folded into the reducer actions themselves (`updateFavorite`, `updateMute`, `updatePinned`, `updatePostPin`, `updatePostBookmark`), since they already know which query keys they touch. See "`cancelQueries` only where there is data" above for the one thing that cancel must not catch. `cancelQueries` returns a promise; the reducers stay synchronous and fire it without awaiting (fire-and-forget) rather than becoming `async`, since callers already treat these as synchronous cache writes.

## Invalidation is an escape hatch

Invalidation is not how this app applies a mutation's effect. Four of the six reducers
(`useEventCacheReducer`, `usePerformerCacheReducer`, `useUserCacheReducer`,
`usePhotostreamCacheReducer`) contain no invalidation at all. The two that do expose it as a single
named action — `invalidateFez` and `invalidateForum` — and those are called for exactly two reasons:

- **Rollback.** Step 4 of the optimistic pattern: after inverting a boolean, invalidate so the
  server gets the last word instead of our captured stale copy.
- **Desync.** A websocket push or a deliberate full refresh where the client genuinely does not know
  what changed.

Both escape hatches skip queries with no `queryFn` (persisted-cache entries whose screen hasn't
mounted this session), since React Query has nothing to refetch them with and throws otherwise.

If you are reaching for `invalidateQueries` on a success path, the reducer is missing an action or a
predicate — write that instead. Refetching a page of results over the ship's network is the cost
this whole pattern exists to avoid.

And when invalidation _is_ right, go through `getCacheKeys()`. Never hardcode a query key.

## Debugging the query cache

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
