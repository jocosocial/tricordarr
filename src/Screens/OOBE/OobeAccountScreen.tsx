import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {MinorActionListItem} from '#src/Components/Lists/Items/MinorActionListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LogoutDeviceModalView} from '#src/Components/Views/Modals/LogoutModal';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeAccountScreen>;

export const OobeAccountScreen = ({navigation}: Props) => {
  const {theme} = useAppTheme();
  const {isLoggedIn} = useSession();
  const {data: profilePublicData} = useUserProfileQuery();
  const {setModalContent, setModalVisible} = useModal();

  const handleLogoutModal = (allDevices = false) => {
    setModalContent(<LogoutDeviceModalView allDevices={allDevices} />);
    setModalVisible(true);
  };

  return (
    <AppView>
      {!isLoggedIn && (
        <ScrollingContentView isStack={false}>
          <PaddedContentView>
            <Text>Accounts are new every year. Only create an account if you have not done so this year.</Text>
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              buttonText={'Create Account'}
              onPress={() => navigation.push(OobeStackComponents.oobeRegisterScreen)}
            />
          </PaddedContentView>
          <PaddedContentView>
            <Text>If you already created an account this year you can log in with it below.</Text>
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
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
                onPress={() => handleLogoutModal()}
              />
              <MinorActionListItem
                title={'Logout all devices'}
                icon={AppIcons.error}
                onPress={() => handleLogoutModal(true)}
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
                onPress={() => handleLogoutModal()}
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
