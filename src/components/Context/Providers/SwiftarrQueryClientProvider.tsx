import React, {PropsWithChildren, useState} from 'react';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {asyncStoragePersister, SwiftarrQueryClient} from '../../../libraries/Network/APIClient';
import {SwiftarrQueryClientContext} from '../Contexts/SwiftarrQueryClientContext';
import axios from 'axios';
import {Query} from '@tanstack/react-query';

export const SwiftarrQueryClientProvider = ({children}: PropsWithChildren) => {
  const [errorCount, setErrorCount] = useState(0);
  // https://www.benoitpaul.com/blog/react-native/offline-first-tanstack-query/
  // https://tanstack.com/query/v4/docs/react/guides/query-invalidation
  const onSuccess = () => {
    console.log('[SwiftarrQueryClientProvider.tsx] Successfully loaded query client.');
    SwiftarrQueryClient.resumePausedMutations().then(() => {
      SwiftarrQueryClient.invalidateQueries().then(() => {
        console.log('[SwiftarrQueryClientProvider.tsx] Finished resuming offline data.');
      });
    });
  };

  const queryCache = SwiftarrQueryClient.getQueryCache();
  queryCache.config = {
    onError: (error, query) => {
      if (axios.isAxiosError(error)) {
        // console.log('LMAO', error);
        // console.log('RESP', error.response?.data);
        // Even 404's have responses.
        // if (!error.response?.data.reason) {
        //   console.log('[SwiftarrQueryClientProvider.tsx] Query error encountered.');
        //   setErrorCount(errorCount + 1);
        // }
        // I think I was getting too clever. See how this goes for now.
        console.log('[SwiftarrQueryClientProvider.tsx] Query error encountered via', query.queryKey);
        setErrorCount(errorCount + 1);
      }
    },
    onSuccess: (data, query) => {
      if (errorCount !== 0) {
        // Axios honors cache-control headers that we set on the images and will
        // return image data if we have it, which triggers the app into thinking that everything
        // is working again. This is sorta a hack unless I can figure out a way to "disable" Axios
        // caching, which doesn't feel like the right decision.
        if (String(query.queryKey[0]).includes('/image/')) {
          console.log('[SwiftarrQueryClientProvider.tsx] Skipping image path because Axios is weird.');
          return;
        }
        console.log('[SwiftarrQueryClientProvider.tsx] Resetting error count via', query.queryKey);
        setErrorCount(0);
      }
    },
  };

  const shouldDehydrateQuery = (query: Query) => {
    const noHydrate = ['/notification/global', '/client/health'];
    return !noHydrate.includes(query.queryKey[0] as string);
  };

  const disruptionDetected = errorCount >= 1;

  return (
    <SwiftarrQueryClientContext.Provider value={{errorCount, setErrorCount, disruptionDetected: disruptionDetected}}>
      <PersistQueryClientProvider
        client={SwiftarrQueryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          dehydrateOptions: {
            shouldDehydrateQuery: shouldDehydrateQuery,
          },
        }}
        onSuccess={onSuccess}>
        {children}
      </PersistQueryClientProvider>
    </SwiftarrQueryClientContext.Provider>
  );
};
