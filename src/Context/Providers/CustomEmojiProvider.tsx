import FastImage from '@d11/react-native-fast-image';
import React, {PropsWithChildren, useEffect, useMemo} from 'react';

import {CustomEmojiContext} from '#src/Context/Contexts/CustomEmojiContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {buildCustomEmojiCatalog, CustomEmojiData} from '#src/Libraries/Reactions/CustomEmojiCatalog';
import {useOpenQuery} from '#src/Queries/OpenQuery';

/**
 * Provides the custom emoji catalog to pickers and post rendering.
 *
 * Swiftarr's catalog is the only definition of custom emoji; the app bundles none. A bundled list
 * was a second definition that the server could add to but never remove from. The catalog is kept
 * in the persisted query cache and its images in FastImage's disk cache, so both survive an offline
 * start once they have loaded. Until the first load, emoji tokens render as plain text.
 *
 * This is a provider rather than a hook that queries: every emoji, reaction badge and post body
 * reads the catalog, and a long thread would otherwise hold a query observer for each of them. It
 * sits above ShellProvider so dialogs and menus rendered in the Paper portal can read it too.
 */
export const CustomEmojiProvider = ({children}: PropsWithChildren) => {
  const {serverUrl} = useSwiftarrQueryClient();
  const {data} = useOpenQuery<CustomEmojiData[]>('/client/emoji', {
    staleTime: 24 * 60 * 60 * 1000,
    // A server that predates the endpoint answers 404 on every launch. Posts are still readable
    // without custom emoji, so that is not worth an error message.
    meta: {silentError: true},
  });
  const catalog = useMemo(() => buildCustomEmojiCatalog(data, serverUrl), [data, serverUrl]);

  // Download every image as soon as the catalog is known, so emoji are already on disk when a post
  // or the picker first shows them rather than appearing one by one over ship wifi. FastImage never
  // re-downloads a URL it has cached, which is fine because an emoji's image is never changed: a new
  // picture means a new emoji, with its own URL.
  useEffect(() => {
    const sources = Object.values(catalog).map(emoji => ({uri: emoji.uri}));
    if (sources.length > 0) {
      FastImage.preload(sources);
    }
  }, [catalog]);

  return <CustomEmojiContext.Provider value={catalog}>{children}</CustomEmojiContext.Provider>;
};
