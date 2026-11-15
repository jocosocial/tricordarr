import {useCallback} from 'react';

import {SwitchOptions, SwitchResult, useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {accountName} from '#src/Libraries/Account';
import {navigateToLogin} from '#src/Libraries/Navigation';
import {Account} from '#src/Structs/SessionStructs';

/**
 * Switch to an account from UI. A signed-out or revoked account opens the login form pre-filled
 * with its username and server instead; a switch that lands toasts "Signed in as username".
 * `isSwitching` is true while any switch is pending, for disabling the controls that start one.
 */
export const useAccountSwitcher = () => {
  const {switchToAccount, pendingAccountID} = useSession();
  const {setSnackbarPayload} = useSnackbar();

  const switchAccount = useCallback(
    async (account: Account, options?: SwitchOptions): Promise<SwitchResult> => {
      const result = await switchToAccount(account.accountID, options);
      if (result === 'needs-login') {
        navigateToLogin({serverUrl: account.serverUrl, username: account.username});
      } else if (result === 'switched') {
        setSnackbarPayload({message: `Signed in as ${accountName(account)}`, messageType: 'success'});
      }
      return result;
    },
    [switchToAccount, setSnackbarPayload],
  );

  return {switchAccount, isSwitching: pendingAccountID !== null};
};
