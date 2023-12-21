Backlog
* https://shopify.github.io/flash-list/

Work Queue
* Confirm against canonical API endpoints

Nightly
* The aggressive avatar querying is also worth reconsidering
  * it's not actually doing it
  * axios-cache-adapter
```
// Create a cache adapter with a custom debug function
const cache = setupCache({
debug: (type, data) => {
console.log(`Cache Debug [${type}]`, data);
},
});

// Create an Axios instance with the cache adapter
const api = axios.create({
adapter: cache.adapter,
});
```
* Can I do the generic use Nav push to cheat the stacks?
* At 1AM EST with late flip on Tuesday, set clocks forward event was soon not now.
