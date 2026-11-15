import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {IconButton, Menu} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {anonymousSessionLabel} from '#src/Libraries/Account';
import {alertRemoveAnonymousSession} from '#src/Libraries/Alerts/AuthAlerts';
import {createLogger} from '#src/Libraries/Logger';
import {SettingsStackScreenComponents, useSettingsStack} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
import {Session} from '#src/Structs/SessionStructs';

const logger = createLogger('AnonymousSessionActionsMenu.tsx');

const menuButtonStyles = StyleSheet.create({
  button: {margin: 0},
});

interface AnonymousSessionActionsMenuProps {
  session: Session;
}

/**
 * Actions for an anonymous session in the Accounts list: removing it from this device. Disabled
 * while the removal runs so a second tap cannot start another.
 */
export const AnonymousSessionActionsMenu = ({session}: AnonymousSessionActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {removeSession} = useSession();
  const {appConfig} = useConfig();
  const settingsNavigation = useSettingsStack();
  const [busy, setBusy] = useState(false);

  const onRemove = () => {
    closeMenu();
    alertRemoveAnonymousSession(anonymousSessionLabel(session), async () => {
      setBusy(true);
      try {
        await removeSession(session.sessionID);
      } catch (error) {
        logger.error('Removing anonymous session failed:', error);
      } finally {
        setBusy(false);
      }
    });
  };

  const onDetails = () => {
    settingsNavigation.push(SettingsStackScreenComponents.sessionDetails, {sessionID: session.sessionID});
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
          testID={'anonymousSessionMenu-button'}
        />
      }>
      <Menu.Item leadingIcon={AppIcons.delete} title={'Remove'} onPress={onRemove} disabled={busy} />
      {appConfig.enableDeveloperOptions && (
        <Menu.Item leadingIcon={AppIcons.info} title={'Details'} onPress={onDetails} />
      )}
    </AppMenu>
  );
};
