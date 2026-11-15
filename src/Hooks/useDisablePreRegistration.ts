import {useState} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {alertDisablePreRegistration} from '#src/Libraries/Alerts/SettingsAlerts';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('useDisablePreRegistration.ts');

/**
 * Shared flow for turning off pre-registration mode on the current session's server. Used by the Cruise
 * Settings button and the hidden multi-tap on the pre-registration banner.
 *
 * `promptDisablePreRegistration` shows the confirmation alert and, on confirm, overrides the server's own setting (no remount).
 * `isDisabling` is true while that update is in flight so callers can ignore re-entry.
 */
export const useDisablePreRegistration = () => {
  const {currentSession, setPreRegistrationOverride} = useSession();
  const [isDisabling, setIsDisabling] = useState(false);

  const promptDisablePreRegistration = () => {
    if (!currentSession) {
      logger.error('Cannot disable pre-registration mode: no current session');
      return;
    }
    alertDisablePreRegistration(async () => {
      setIsDisabling(true);
      try {
        logger.debug('toggling pre-registration mode to', false);
        await setPreRegistrationOverride(currentSession.serverUrl, false);
      } finally {
        setIsDisabling(false);
      }
    });
  };

  return {promptDisablePreRegistration, isDisabling};
};
