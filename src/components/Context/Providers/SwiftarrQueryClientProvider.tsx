import React, {PropsWithChildren, useState} from 'react';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {asyncStoragePersister, SwiftarrQueryClient} from '../../../libraries/Network/APIClient';
import {SwiftarrQueryClientContext} from '../Contexts/SwiftarrQueryClientContext';
import axios from 'axios';

export const SwiftarrQueryClientProvider = ({children}: PropsWithChildren) => {
  const [errorCount, setErrorCount] = useState(0);
  // https://www.benoitpaul.com/blog/react-native/offline-first-tanstack-query/
  // https://tanstack.com/query/v4/docs/react/guides/query-invalidation
  const onSuccess = () => {
    // @TODO maybe find a better place to wipe this?
    SwiftarrQueryClient.setQueryData(['/client/health'], () => null);
    console.log('[SwiftarrQueryClientProvider.tsx] Successfully loaded query client.');
    SwiftarrQueryClient.resumePausedMutations().then(() => {
      SwiftarrQueryClient.invalidateQueries().then(() => {
        console.log('[SwiftarrQueryClientProvider.tsx] Finished resuming offline data.');
      });
    });
  };

  const queryCache = SwiftarrQueryClient.getQueryCache();
  queryCache.config = {
    onError: error => {
      if (axios.isAxiosError(error)) {
        // console.log('LMAO', error);
        // console.log('RESP', error.response?.data);
        // Even 404's have responses.
        // if (!error.response?.data.reason) {
        //   console.log('[SwiftarrQueryClientProvider.tsx] Query error encountered.');
        //   setErrorCount(errorCount + 1);
        // }
        // I think I was getting too clever. See how this goes for now.
        console.log('[SwiftarrQueryClientProvider.tsx] Query error encountered.');
        setErrorCount(errorCount + 1);
      }
    },
    onSuccess: () => {
      if (errorCount !== 0) {
        console.log('[SwiftarrQueryClientProvider.tsx] Resetting error count.');
        setErrorCount(0);
      }
    },
  };

  const disruptionDetected = errorCount >= 1;

  return (
    <SwiftarrQueryClientContext.Provider value={{errorCount, setErrorCount, disruptionDetected: disruptionDetected}}>
      <PersistQueryClientProvider
        client={SwiftarrQueryClient}
        persistOptions={{persister: asyncStoragePersister}}
        onSuccess={onSuccess}>
        {children}
      </PersistQueryClientProvider>
    </SwiftarrQueryClientContext.Provider>
  );
};
