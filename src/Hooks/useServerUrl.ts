import {useMemo} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';

/**
 * URL of the server this session uses. Lets providers above SwiftarrQueryClientProvider read the
 * same value that it exposes.
 */
export const useServerUrl = (): string => {
  const {appConfig} = useConfig();
  const {currentSession} = useSession();

  return useMemo(() => {
    if (!currentSession) {
      // First-launch / no session only. Not a substitute while Session is hydrating;
      // SessionProvider withholds children until load completes.
      return appConfig.serverUrl;
    }
    return currentSession.serverUrl;
  }, [currentSession, appConfig.serverUrl]);
};
