import React from 'react';
import {ScrollView, View} from 'react-native';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

const toSecureString = (originalText?: string) => {
  if (!originalText) {
    return '';
  }
  // Extract the first three characters
  const firstThreeCharacters = originalText.slice(0, 3);

  // Replace the remaining characters with asterisks
  const asterisks = '*'.repeat(originalText.length - 3);

  // Concatenate the first three characters with asterisks
  return firstThreeCharacters + asterisks;
};

export const UserInfoSettingsScreen = () => {
  const {data: profilePublicData} = useUserProfileQuery();
  const {tokenData} = useAuth();
  const [showToken, setShowToken] = React.useState(false);

  const toggleToken = () => {
    setShowToken(!showToken);
  };

  return (
    <AppView>
      <ScrollView>
        <View>
          <ListSubheader>Profile Public Data</ListSubheader>
          <DataFieldListItem title={'UserID'} description={profilePublicData?.header.userID} />
          <DataFieldListItem title={'Username'} description={profilePublicData?.header.username} />
        </View>
        <View>
          <ListSubheader>Token Auth Data</ListSubheader>
          <DataFieldListItem title={'UserID'} description={tokenData?.userID} />
          <DataFieldListItem title={'Access Level'} description={tokenData?.accessLevel} />
          <DataFieldListItem
            title={'Token'}
            onPress={toggleToken}
            description={showToken ? tokenData?.token : toSecureString(tokenData?.token)}
          />
        </View>
      </ScrollView>
    </AppView>
  );
};
