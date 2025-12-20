import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {UserDirectoryScreenActionsMenu} from '#src/Components/Menus/User/UserDirectoryScreenActionsMenu';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {UserDirectoryText} from '#src/Components/Text/UserRelationsText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.userDirectoryScreen>;

export const UserDirectoryScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={'/directory'}>
        <UserDirectoryScreenInner {...props} />
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};

const UserDirectoryScreenInner = ({navigation}: Props) => {
  const {appConfig} = useConfig();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <UserDirectoryScreenActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [navigation, getNavButtons]);

  if (appConfig.preRegistrationMode) {
    return <UserDirectoryPreRegistrationScreen />;
  }

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserDirectoryText />
        </PaddedContentView>
        <PaddedContentView>
          <UserMatchSearchBar
            excludeHeaders={[]}
            onPress={user =>
              navigation.push(CommonStackComponents.userProfileScreen, {
                userID: user.userID,
              })
            }
            clearOnPress={false}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};

const UserDirectoryPreRegistrationScreen = () => {
  return (
    <AppView>
      <ScrollingContentView>
        <HelpTopicView>
          The user directory is not available in pre-registration mode. However you can still add favorite users. Doing
          so can enable you to call them (using The Kraken for iOS only). It will also put them in a list that you can
          look at. Beyond that it currently means nothing.
        </HelpTopicView>
        <HelpTopicView>
          To add a favorite user, tap the menu button in the top right of this screen and select "Favorite Users".
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
