import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {IconButton, Menu} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {accountLabel} from '#src/Libraries/Account';
import {alertRemoveAccount, alertSignOutAccount} from '#src/Libraries/Alerts/AuthAlerts';
import {createLogger} from '#src/Libraries/Logger';
import {SettingsStackScreenComponents, useSettingsStack} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
import {Account} from '#src/Structs/SessionStructs';

const logger = createLogger('AccountActionsMenu.tsx');

const menuButtonStyles = StyleSheet.create({
  button: {margin: 0},
});

interface AccountActionsMenuProps {
  account: Account;
}

/**
 * Per-account actions in the Accounts list: sign out of this device, remove the account, and (with
 * developer options on) its session details. Signing out and removing are disabled while either
 * is running so a second tap cannot start another.
 */
export const AccountActionsMenu = ({account}: AccountActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {signOut, removeAccount, sessions} = useSession();
  const {appConfig} = useConfig();
  const settingsNavigation = useSettingsStack();
  const [busy, setBusy] = useState(false);

  const label = accountLabel(account);
  const accountSession = sessions.find(s => s.accountID === account.accountID);

  /**
   * Run a sign-out or removal behind the confirm alert with the controls disabled meanwhile.
   */
  const run = (task: () => Promise<void>) => async () => {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      logger.error('Account action failed:', error);
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = () => {
    closeMenu();
    alertSignOutAccount(
      label,
      run(() => signOut(account.accountID)),
    );
  };

  const onRemove = () => {
    closeMenu();
    alertRemoveAccount(
      label,
      run(() => removeAccount(account.accountID)),
    );
  };

  const onDetails = () => {
    if (accountSession) {
      settingsNavigation.push(SettingsStackScreenComponents.sessionDetails, {sessionID: accountSession.sessionID});
    }
  };

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <IconButton
          icon={AppIcons.menu}
          onPress={openMenu}
          disabled={busy}
          style={menuButtonStyles.button}
          testID={'accountMenu-button'}
        />
      }>
      {account.status === 'signedIn' && (
        <Menu.Item leadingIcon={AppIcons.logout} title={'Sign Out'} onPress={onSignOut} disabled={busy} />
      )}
      <Menu.Item leadingIcon={AppIcons.delete} title={'Remove'} onPress={onRemove} disabled={busy} />
      {appConfig.enableDeveloperOptions && accountSession && (
        <Menu.Item leadingIcon={AppIcons.info} title={'Details'} onPress={onDetails} />
      )}
    </AppMenu>
  );
};
