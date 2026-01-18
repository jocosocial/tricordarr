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

## Websocket Keepalive

https://www.w3.org/Bugs/Public/show_bug.cgi?id=13104
