import React, {useState} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {UserRoleType} from '#src/Enums/UserRoleType';
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
  const {data: profilePublicData, refetch: refetchProfile} = useUserProfileQuery();
  const {tokenData} = useAuth();
  const {roles, refetch: refetchRoles} = useRoles();
  const [showToken, setShowToken] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const toggleToken = () => {
    setShowToken(!showToken);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchRoles()]);
    setRefreshing(false);
  };

  const rolesDescription = roles.length > 0 ? roles.map(role => UserRoleType.getLabel(role)).join(', ') : 'None';

  return (
    <AppView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
        <View>
          <ListSubheader>User Roles</ListSubheader>
          <DataFieldListItem title={'Roles'} description={rolesDescription} />
        </View>
      </ScrollView>
    </AppView>
  );
};
