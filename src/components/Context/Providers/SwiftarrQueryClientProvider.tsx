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
    console.log('[SwiftarrQueryClientProvider.tsx] Successfully loaded query client.');
    SwiftarrQueryClient.resumePausedMutations().then(() => {
      SwiftarrQueryClient.invalidateQueries().then(() => {
        console.log('[SwiftarrQueryClientProvider.tsx] Finished resuming offline data.');
      });
    });
  };

  // Error codes that mean the user messed up.
  const excludedErrorCodes = [400];

  const queryCache = SwiftarrQueryClient.getQueryCache();
  queryCache.config = {
    onError: error => {
      if (axios.isAxiosError(error)) {
        if (error.response && !(error.response.status in excludedErrorCodes)) {
          console.log('[SwiftarrQueryClientProvider.tsx] Query error encountered.');
          setErrorCount(errorCount + 1);
        }
      }
    },
    onSuccess: () => {
      if (errorCount !== 0) {
        console.log('[SwiftarrQueryClientProvider.tsx] Resetting error count.');
        setErrorCount(0);
      }
    },
  };

  return (
    <SwiftarrQueryClientContext.Provider value={{errorCount, setErrorCount}}>
      <PersistQueryClientProvider
        client={SwiftarrQueryClient}
        persistOptions={{persister: asyncStoragePersister}}
        onSuccess={onSuccess}>
        {children}
      </PersistQueryClientProvider>
    </SwiftarrQueryClientContext.Provider>
  );
};
