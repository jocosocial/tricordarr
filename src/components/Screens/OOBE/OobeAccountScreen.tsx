import React from 'react';
import {List, Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {ListSection} from '../../Lists/ListSection';
import {MinorActionListItem} from '../../Lists/Items/MinorActionListItem';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useModal} from '../../Context/Contexts/ModalContext';
import {LogoutDeviceModalView} from '../../Views/Modals/LogoutModal';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeAccountScreen, NavigatorIDs.oobeStack>;

export const OobeAccountScreen = ({navigation}: Props) => {
  const theme = useAppTheme();
  const {isLoggedIn} = useAuth();
  const {profilePublicData} = useUserData();
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
            <Text>
              If you created an account during the pre-registration period or on a different device you can log in with
              it below.
            </Text>
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
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeFinishScreen)}
        rightDisabled={!isLoggedIn}
      />
    </AppView>
  );
};
