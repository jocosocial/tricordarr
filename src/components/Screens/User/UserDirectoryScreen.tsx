import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {UserDirectoryText} from '../../Text/UserRelationsText';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents} from '../../Navigation/CommonScreens';
import {MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator';
import {MainStackComponents} from '../../../libraries/Enums/Navigation';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.userDirectoryScreen>;
export const UserDirectoryScreen = ({navigation}: Props) => {
  const {isLoggedIn} = useAuth();
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
            userHeaders={[]}
            onPress={user => navigation.push(CommonStackComponents.userProfileScreen, {
              userID: user.userID,
            })}
            clearOnPress={false}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
