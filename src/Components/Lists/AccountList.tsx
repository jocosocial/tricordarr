import React from 'react';

import {AccountListItem} from '#src/Components/Lists/Items/AccountListItem';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAccountSwitcher} from '#src/Hooks/useAccountSwitcher';
import {sortAccountsForDisplay} from '#src/Libraries/Account';

/**
 * Every account, most recently used first. Tapping a row switches to that account; rows are
 * disabled while a switch is in flight so a second tap cannot start another.
 */
export const AccountList = () => {
  const {accounts} = useSession();
  const {switchAccount, isSwitching} = useAccountSwitcher();

  return (
    <>
      {sortAccountsForDisplay(accounts).map(account => (
        <AccountListItem
          key={account.accountID}
          account={account}
          disabled={isSwitching}
          onPress={() => switchAccount(account)}
        />
      ))}
    </>
  );
};
