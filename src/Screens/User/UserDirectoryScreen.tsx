import React, {useCallback, useEffect} from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {UserSearchBar} from '#src/Components/Search/UserSearchBar';
import {UserDirectoryText} from '#src/Components/Text/UserRelationsText';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {View} from 'react-native';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {UserDirectoryScreenActionsMenu} from '#src/Components/Menus/User/UserDirectoryScreenActionsMenu';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.userDirectoryScreen>;
export const UserDirectoryScreen = ({navigation}: Props) => {
  const {isLoggedIn} = useAuth();

  const getNavButtons = useCallback(() => {
    if (!isLoggedIn) {
      return <></>;
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <UserDirectoryScreenActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [navigation, getNavButtons]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserDirectoryText />
        </PaddedContentView>
        <PaddedContentView>
          <UserSearchBar
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
