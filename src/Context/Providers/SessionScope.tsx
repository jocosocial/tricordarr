import React, {Fragment, PropsWithChildren} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';

/**
 * Remounts everything beneath it whenever the session changes. Keying the subtree is what Bluesky
 * does with `<Fragment key={currentAccount?.did}>` in App.tsx: one move resets navigation, sockets,
 * filters, selection state and in-memory caches, with no teardown list to keep in sync, and each
 * session gets its own QueryClient (see SwiftarrQueryClientProvider).
 *
 * Providers above this (Config, Session, Oobe, Permissions, Theme, Navigation, Keyboard, Style,
 * ErrorHandler, Snackbar) are device-scoped and survive a switch. Everything that reads the API
 * client, the query cache, sockets or the root navigator belongs beneath it.
 */
export const SessionScope = ({children}: PropsWithChildren) => {
  const {currentSession} = useSession();
  return <Fragment key={currentSession?.sessionID ?? 'none'}>{children}</Fragment>;
};
