import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';

import {MinorActionListItem} from '#src/Components/Lists/Items/MinorActionListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSignOut} from '#src/Context/Contexts/SignOutContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
  useSettingsStack,
} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.accountManagement>;

/**
 * Account settings and logout. Do not wrap in LoggedInScreen: that checkpoint
 * would swap to NotLoggedInView the moment the session clears, which is the
 * flash we freeze past.
 *
 * `isLoggingOut` is set in onLogoutStart (before performSignOut) and never
 * cleared — this screen unmounts on onLoggedOut goBack. Until then we keep
 * rendering the account list even after `isLoggedIn` / `currentUserID` go
 * false. goBack must wait until after teardown so Today (under this Settings
 * stack when opened from MainAccountMenu) is already logged-out when revealed.
 */
export const AccountManagementScreen = ({navigation}: Props) => {
  const settingsNavigation = useSettingsStack();
  const {isLoggedIn, currentUserID} = useSession();
  const {confirmLogout} = useSignOut();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logoutOptions = {
    onLogoutStart: () => setIsLoggingOut(true),
    onLoggedOut: () => navigation.goBack(),
  };

  if (!isLoggedIn && !isLoggingOut) {
    return <NotLoggedInView />;
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          {(currentUserID != null || isLoggingOut) && (
            <>
              <ListSection>
                <ListSubheader>Manage Your Account</ListSubheader>
                <MinorActionListItem
                  title={'Change Username'}
                  icon={AppIcons.edituser}
                  onPress={() => settingsNavigation.push(SettingsStackScreenComponents.changeUsername)}
                />
                <MinorActionListItem
                  title={'Change Password'}
                  icon={AppIcons.password}
                  onPress={() => settingsNavigation.push(SettingsStackScreenComponents.changePassword)}
                />
                <MinorActionListItem
                  title={'Create Alt Account'}
                  icon={AppIcons.altAccount}
                  onPress={() =>
                    navigation.push(CommonStackComponents.siteUIScreen, {
                      resource: 'createAltAccount',
                    })
                  }
                />
              </ListSection>
              <ListSection>
                <ListSubheader>User Information</ListSubheader>
                <MinorActionListItem
                  title={'Account Info'}
                  icon={AppIcons.info}
                  onPress={() => settingsNavigation.push(SettingsStackScreenComponents.accountInfoSettingsScreen)}
                />
              </ListSection>
            </>
          )}
          <ListSection>
            <ListSubheader>Log Out</ListSubheader>
            <MinorActionListItem
              title={'Logout this device'}
              icon={AppIcons.logout}
              onPress={() => confirmLogout(logoutOptions)}
            />
            {(currentUserID != null || isLoggingOut) && (
              <MinorActionListItem
                title={'Logout all devices'}
                icon={AppIcons.error}
                onPress={() => confirmLogout({...logoutOptions, allDevices: true})}
              />
            )}
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
