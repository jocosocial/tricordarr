import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator.tsx';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {OobeButtonsView} from '../../Views/OobeButtonsView.tsx';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {ListSection} from '../../Lists/ListSection.tsx';
import {MinorActionListItem} from '../../Lists/Items/MinorActionListItem.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {LogoutDeviceModalView} from '../../Views/Modals/LogoutModal.tsx';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeAccountScreen>;

export const OobeAccountScreen = ({navigation}: Props) => {
  const theme = useAppTheme();
  const {isLoggedIn, tokenData} = useAuth();
  const {data: profilePublicData} = useUserProfileQuery({enabled: !!tokenData});
  const {setModalContent, setModalVisible} = useModal();

  const handleLogoutModal = (allDevices = false) => {
    setModalContent(<LogoutDeviceModalView allDevices={allDevices} />);
    setModalVisible(true);
  };

  return (
    <AppView safeEdges={['bottom']}>
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
