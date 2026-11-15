import React from 'react';

import {AppBottomSheet} from '#src/Components/Sheets/AppBottomSheet';
import {AppBottomSheetButton} from '#src/Components/Sheets/AppBottomSheetButton';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAccountSwitcher} from '#src/Hooks/useAccountSwitcher';
import {accountLabel, isAccountPreRegistration, sortAccountsForDisplay} from '#src/Libraries/Account';
import {navigateToAddAccount} from '#src/Libraries/Navigation';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

interface AccountSwitcherSheetProps {
  isPresented: boolean;
  onDismiss: () => void;
}

/**
 * Quick account switcher: one button per account (a check marks the current one), plus Add Account
 * and Manage Accounts. Opened by long-pressing the account avatar. Buttons are disabled while a
 * switch is in flight.
 */
export const AccountSwitcherSheet = ({isPresented, onDismiss}: AccountSwitcherSheetProps) => {
  const {accounts, currentAccount, serverProfiles} = useSession();
  const {switchAccount, isSwitching} = useAccountSwitcher();
  const mainNavigation = useMainStack();
  const {theme} = useAppTheme();

  const onSwitch = async (accountID: string) => {
    const account = accounts.find(a => a.accountID === accountID);
    // No explicit dismiss: a switch remounts the scope (sheet included), and a login redirect is a
    // navigation, which closes the sheet.
    if (account && account.accountID !== currentAccount?.accountID) {
      await switchAccount(account);
    }
  };

  const onManage = () => {
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.sessionSettings,
    });
  };

  return (
    <AppBottomSheet
      title={'Accounts'}
      isPresented={isPresented}
      onDismiss={onDismiss}
      buttonCount={accounts.length + 2}>
      {sortAccountsForDisplay(accounts).map(account => {
        const isCurrent = account.accountID === currentAccount?.accountID;
        return (
          <AppBottomSheetButton
            key={account.accountID}
            buttonText={accountLabel(account)}
            // Pre-registration accounts are marked with their own icon; the current account is already green.
            icon={
              isAccountPreRegistration(account, serverProfiles)
                ? AppIcons.preregistration
                : isCurrent
                  ? AppIcons.check
                  : undefined
            }
            onPress={() => onSwitch(account.accountID)}
            testID={`switchAccount-${account.accountID}`}
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
