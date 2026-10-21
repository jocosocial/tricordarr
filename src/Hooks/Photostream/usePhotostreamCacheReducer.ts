import {InfiniteData, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {filterItemsFromPages, findInPages, insertAtEdge, PageItemAccessor} from '#src/Libraries/CacheReduction';
import {PhotostreamImageData, PhotostreamListData} from '#src/Structs/ControllerStructs';

/**
 * Key prefix shared by every `/photostream` list query (global, event-, user- and
 * location-scoped). Matching on the prefix does not touch `/photostream/placenames`:
 * TanStack compares key elements, and those are distinct strings.
 */
const PHOTOSTREAM_LIST_KEY = '/photostream';

/** Accessor for PhotostreamListData pages (photos is required). */
const photostreamAccessor: PageItemAccessor<PhotostreamListData, PhotostreamImageData> = {
  get: page => page.photos,
  set: (page, items) => ({...page, photos: items}),
};

/** The filter params `usePhotostreamQuery` puts at `queryKey[1]` of a `/photostream` query. */
interface PhotostreamQueryParams {
  eventID?: string;
  locationName?: string;
  byUser?: string;
}

/**
 * Whether a `/photostream` query scoped by `params` should contain `image`.
 *
 * `usePhotostreamQuery` builds its params as `{}` for the global stream and
 * `{eventID}` / `{byUser}` / `{locationName}` for the scoped variants, so each
 * cached query has to be judged on its own params: blindly prepending to every
 * `/photostream` cache would drop the photo into unrelated events' streams and
 * other users' streams.
 */
function queryParamsIncludeImage(params: PhotostreamQueryParams | undefined, image: PhotostreamImageData): boolean {
  if (params?.eventID) {
    return image.event?.eventID === params.eventID;
  }
  if (params?.byUser) {
    return image.author.userID === params.byUser;
  }
  if (params?.locationName) {
    return image.location === params.locationName;
  }
  return true;
}

/**
 * Hook that exposes discrete actions for updating React Query caches after
 * photostream mutations. Each action calls setQueryData and always returns new
 * objects so React Query detects the change and triggers re-renders.
 *
 * No local state, no useReducer -- just named functions that transform the cache.
 *
 * These actions are how the `/photostream` list caches are kept current: nothing
 * invalidates or refetches them any more (see #622). The stream is a page of
 * images on a slow ship network, and both mutations that change it -- the user's
 * own upload and a moderator's delete -- hand us everything we need to patch it
 * locally.
 */
export const usePhotostreamCacheReducer = () => {
  const queryClient = useQueryClient();

  /**
   * Prepend a newly uploaded image to the front of every `/photostream` list
   * cache whose filter params it matches (the global stream plus any
   * event-, user- or location-scoped ones). Applied from the upload response
   * so the photo is on screen without waiting on a refetch.
   *
   * A cache that already contains the postID is left alone, so a repeated
   * apply can't duplicate the photo.
   */
  const prependImage = useCallback(
    (image: PhotostreamImageData) => {
      // An already-in-flight refetch would otherwise resolve after this write and
      // stomp it back to the pre-upload stream. Fire-and-forget: this stays a
      // synchronous cache write for callers.
      queryClient.cancelQueries({queryKey: [PHOTOSTREAM_LIST_KEY]});

      for (const query of queryClient.getQueryCache().findAll({queryKey: [PHOTOSTREAM_LIST_KEY]})) {
        if (!queryParamsIncludeImage(query.queryKey[1] as PhotostreamQueryParams | undefined, image)) {
          continue;
        }
        queryClient.setQueryData<InfiniteData<PhotostreamListData>>(query.queryKey, oldData => {
          if (!oldData || findInPages(oldData, photostreamAccessor, p => p.postID === image.postID)) {
            return oldData;
          }
          return insertAtEdge(oldData, photostreamAccessor, image, 'start');
        });
      }
    },
    [queryClient],
  );

  /**
   * Remove a deleted image (by postID) from every `/photostream` list cache.
   * Unlike an insert, a removal doesn't depend on knowing a query's filter
   * params -- the photo is gone from all of them -- so it applies universally.
   */
  const removeImage = useCallback(
    (postID: number) => {
      queryClient.cancelQueries({queryKey: [PHOTOSTREAM_LIST_KEY]});

      queryClient.setQueriesData<InfiniteData<PhotostreamListData>>({queryKey: [PHOTOSTREAM_LIST_KEY]}, oldData =>
        oldData ? filterItemsFromPages(oldData, photostreamAccessor, p => p.postID !== postID) : oldData,
      );
    },
    [queryClient],
  );

  return {
    prependImage,
    removeImage,
  };
};
