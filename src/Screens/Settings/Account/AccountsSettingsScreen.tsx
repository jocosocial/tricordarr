import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AccountListItems} from '#src/Components/Lists/AccountListItems';
import {MinorActionListItem} from '#src/Components/Lists/Items/MinorActionListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {navigateToAddAccount} from '#src/Libraries/Navigation';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useSettingsStack} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

/**
 * Accounts: every account and anonymous session on this device (tap to switch, menu to sign out or
 * remove) and adding another. Adding picks a server first, so there is no separate list of servers.
 */
export const AccountsSettingsScreen = () => {
  const settingsNavigation = useSettingsStack();
  const {accounts, sessions} = useSession();

  const getNavButtons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => settingsNavigation.push(CommonStackComponents.accountsHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    ),
    [settingsNavigation],
  );

  useEffect(() => {
    settingsNavigation.setOptions({headerRight: getNavButtons});
  }, [getNavButtons, settingsNavigation]);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          <ListSection>
            <ListSubheader>Accounts</ListSubheader>
            {accounts.length === 0 && sessions.length === 0 && (
              <MinorActionListItem
                title={'No accounts'}
                icon={AppIcons.info}
                onPress={() => {}}
                description={'Add an account to log in.'}
              />
            )}
            <AccountListItems />
            <MinorActionListItem
              title={'Add Account'}
              icon={AppIcons.new}
              description={'Log in, create an account, or browse another server.'}
              onPress={() => navigateToAddAccount()}
            />
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
