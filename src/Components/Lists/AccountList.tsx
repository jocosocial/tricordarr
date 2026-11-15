import React from 'react';

import {AccountListItem} from '#src/Components/Lists/Items/AccountListItem';
import {AnonymousSessionListItem} from '#src/Components/Lists/Items/AnonymousSessionListItem';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAccountSwitcher} from '#src/Hooks/useAccountSwitcher';
import {getAccountListEntries} from '#src/Libraries/Account';

/**
 * Every account and anonymous session, oldest first. Tapping a row switches to it; rows are
 * disabled while a switch is in flight so a second tap cannot start another. Switching keeps the
 * current navigation state so the user stays on the screen hosting the list.
 */
export const AccountList = () => {
  const {accounts, sessions, switchToSession} = useSession();
  const {switchAccount, isSwitching} = useAccountSwitcher();

  return (
    <>
      {getAccountListEntries(accounts, sessions).map(entry =>
        entry.kind === 'account' ? (
          <AccountListItem
            key={entry.key}
            account={entry.account}
            disabled={isSwitching}
            onPress={() => switchAccount(entry.account, {preserveNavigation: true})}
          />
        ) : (
          <AnonymousSessionListItem
            key={entry.key}
            session={entry.session}
            disabled={isSwitching}
            onPress={() => switchToSession(entry.session.sessionID, {preserveNavigation: true})}
          />
        ),
      )}
    </>
  );
};
