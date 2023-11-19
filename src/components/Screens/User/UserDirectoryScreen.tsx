import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {Linking} from 'react-native';
import {UserDirectoryText} from '../../Text/UserRelationsText';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView';

export const UserDirectoryScreen = () => {
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
            onPress={user => Linking.openURL(`tricordarr://user/${user.userID}`)}
            clearOnPress={false}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
