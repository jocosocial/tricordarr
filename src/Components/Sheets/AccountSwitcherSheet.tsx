import React from 'react';

import {AppBottomSheet} from '#src/Components/Sheets/AppBottomSheet';
import {AppBottomSheetButton} from '#src/Components/Sheets/AppBottomSheetButton';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAccountSwitcher} from '#src/Hooks/useAccountSwitcher';
import {
  accountLabel,
  AccountListEntry,
  anonymousSessionLabel,
  getAccountListEntries,
  isServerPreRegistration,
} from '#src/Libraries/Account';
import {navigateToAddAccount} from '#src/Libraries/Navigation';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

interface AccountSwitcherSheetProps {
  isPresented: boolean;
  onDismiss: () => void;
}

/**
 * Quick account switcher: one button per account or anonymous session, plus Add Account and Manage
 * Accounts. Opened by long-pressing the account avatar. Buttons are disabled while a
 * switch is in flight.
 */
export const AccountSwitcherSheet = ({isPresented, onDismiss}: AccountSwitcherSheetProps) => {
  const {accounts, sessions, currentSession, serverProfiles, switchToSession} = useSession();
  const {switchAccount, isSwitching} = useAccountSwitcher();
  const mainNavigation = useMainStack();
  const {theme} = useAppTheme();
  const entries = getAccountListEntries(accounts, sessions);

  // No explicit dismiss: a switch remounts the scope (sheet included), and a login redirect is a
  // navigation, which closes the sheet.
  const onSwitch = async (entry: AccountListEntry) => {
    if (entry.kind === 'anonymous') {
      await switchToSession(entry.session.sessionID);
    } else if (entry.account.accountID !== currentSession?.accountID) {
      await switchAccount(entry.account);
    }
  };

  const onManage = () => {
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.sessionSettings,
    });
  };

  return (
    <AppBottomSheet title={'Accounts'} isPresented={isPresented} onDismiss={onDismiss} buttonCount={entries.length + 2}>
      {entries.map(entry => {
        const serverUrl = entry.kind === 'account' ? entry.account.serverUrl : entry.session.serverUrl;
        const isCurrent =
          entry.kind === 'account'
            ? entry.account.accountID === currentSession?.accountID
            : entry.session.sessionID === currentSession?.sessionID;
        return (
          <AppBottomSheetButton
            key={entry.key}
            buttonText={entry.kind === 'account' ? accountLabel(entry.account) : anonymousSessionLabel(entry.session)}
            // Pre-registration servers are marked with their own icon; the current row is already green.
            icon={
              isServerPreRegistration(serverProfiles.find(p => p.serverUrl === serverUrl))
                ? AppIcons.preregistration
                : isCurrent
                  ? AppIcons.check
                  : undefined
            }
            onPress={() => onSwitch(entry)}
            testID={entry.kind === 'account' ? `switchAccount-${entry.key}` : `switchSession-${entry.key}`}
            disabled={isSwitching}
            // The current account is the positive (green) color; the rest use the FAB greys.
            buttonColor={isCurrent ? theme.colors.twitarrPositiveButton : theme.colors.inverseSurface}
            textColor={isCurrent ? theme.colors.onTwitarrPositiveButton : theme.colors.inverseOnSurface}
          />
        );
      })}
      <AppBottomSheetButton
        buttonText={'Add Account'}
        icon={AppIcons.new}
        onPress={() => navigateToAddAccount()}
        testID={'addAccount-button'}
      />
      <AppBottomSheetButton
        buttonText={'Manage Accounts'}
        icon={AppIcons.altAccount}
        onPress={onManage}
        testID={'manageAccounts-button'}
      />
    </AppBottomSheet>
  );
};
