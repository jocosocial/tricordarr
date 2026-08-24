import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {MinorActionListItem} from '#src/Components/Lists/Items/MinorActionListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSignOut} from '#src/Context/Contexts/SignOutContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeAccountScreen>;

export const OobeAccountScreen = ({navigation}: Props) => {
  const {theme} = useAppTheme();
  const {isLoggedIn, currentSession} = useSession();
  const accessLevel = currentSession?.tokenData?.accessLevel;
  const {data: profilePublicData} = useUserProfileQuery();
  const {confirmLogout} = useSignOut();
  const {preRegistrationMode} = usePreRegistration();

  return (
    <AppView>
      {!isLoggedIn && (
        <ScrollingContentView isStack={false}>
          <PaddedContentView>
            <Text>Accounts are new every year. Only create an account if you have not done so this year.</Text>
          </PaddedContentView>
          {!preRegistrationMode && (
            <PaddedContentView>
              <Text>
                If you created an account during pre-registration, you can instead log in with that account below.
              </Text>
            </PaddedContentView>
          )}
          <PaddedContentView>
            <PrimaryActionButton
              testID={'oobeCreateAccount-button'}
              buttonText={'Create Account'}
              onPress={() => navigation.push(OobeStackComponents.oobeRegisterScreen)}
            />
          </PaddedContentView>
          <PaddedContentView>
            <Text>
              If you already created an account this year (including during pre-registration) you can log in with it
              below.
            </Text>
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              testID={'oobeLogIn-button'}
              buttonColor={theme.colors.twitarrNeutralButton}
              buttonText={'Log In'}
              onPress={() => navigation.push(OobeStackComponents.oobeLoginScreen)}
            />
          </PaddedContentView>
        </ScrollingContentView>
      )}
      {isLoggedIn && profilePublicData && (
        <ScrollingContentView>
          <PaddedContentView>
            <Text>Successfully logged in as user: {profilePublicData.header.username}</Text>
          </PaddedContentView>
          {accessLevel && (
            <PaddedContentView>
              <Text>
                Access level: {UserAccessLevel.getLabel(accessLevel)} ({UserAccessLevel.getDescription(accessLevel)})
              </Text>
            </PaddedContentView>
          )}
          <PaddedContentView>
            <Text>
              If this is incorrect or you wish to change accounts, you can log out below. To proceed with your current
              account, press the Next button at the bottom of the screen.
            </Text>
          </PaddedContentView>
          <PaddedContentView padSides={false}>
            <ListSection>
              <MinorActionListItem
                title={'Logout this device'}
                icon={AppIcons.logout}
                onPress={() => confirmLogout({onLoggedOut: () => navigation.goBack()})}
              />
              <MinorActionListItem
                title={'Logout all devices'}
                icon={AppIcons.error}
                onPress={() => confirmLogout({allDevices: true, onLoggedOut: () => navigation.goBack()})}
              />
            </ListSection>
          </PaddedContentView>
        </ScrollingContentView>
      )}
      {isLoggedIn && !profilePublicData && (
        <ScrollingContentView>
          <PaddedContentView>
            <Text>Something went wrong. Try logging out and logging in again.</Text>
          </PaddedContentView>
          <PaddedContentView padSides={false}>
            <ListSection>
              <MinorActionListItem
                title={'Logout this device'}
                icon={AppIcons.logout}
                onPress={() => confirmLogout({onLoggedOut: () => navigation.goBack()})}
              />
            </ListSection>
          </PaddedContentView>
        </ScrollingContentView>
      )}
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightOnPress={() => navigation.push(OobeStackComponents.oobePermissionsScreen)}
        rightDisabled={!(isLoggedIn && profilePublicData)}
      />
    </AppView>
  );
};
