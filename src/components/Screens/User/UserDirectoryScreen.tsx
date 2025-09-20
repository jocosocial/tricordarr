import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {UserSearchBar} from '../../Search/UserSearchBar.tsx';
import {UserDirectoryText} from '../../Text/UserRelationsText.tsx';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {View} from 'react-native';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {UserDirectoryScreenActionsMenu} from '../../Menus/User/UserDirectoryScreenActionsMenu.tsx';

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
