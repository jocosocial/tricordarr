import React, {PropsWithChildren} from 'react';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {asyncStoragePersister, SwiftarrQueryClient} from '../../../libraries/Network/APIClient';

export const SwiftarrQueryClientProvider = ({children}: PropsWithChildren) => {
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

  return (
    <PersistQueryClientProvider
      client={SwiftarrQueryClient}
      persistOptions={{persister: asyncStoragePersister}}
      onSuccess={onSuccess}>
      {children}
    </PersistQueryClientProvider>
  );
};
