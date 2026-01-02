import React, {useState} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

export const UserInfoSettingsScreen = () => {
  const {data: profilePublicData, refetch: refetchProfile} = useUserProfileQuery();
  const {tokenData} = useAuth();
  const {roles, refetch: refetchRoles} = useRoles();
  const [refreshing, setRefreshing] = useState(false);

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
          <DataFieldListItem title={'Token'} description={tokenData?.token} sensitive={true} />
        </View>
        <View>
          <ListSubheader>User Roles</ListSubheader>
          <DataFieldListItem title={'Roles'} description={rolesDescription} />
        </View>
      </ScrollView>
    </AppView>
  );
};
