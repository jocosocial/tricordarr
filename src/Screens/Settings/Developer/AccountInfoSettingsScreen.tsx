import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

/**
 * Screen for displaying the user's account information.
 *
 * This used to have a dedicated button to reload roles. Which felt silly since
 * pull to refresh is a thing.
 */
export const AccountInfoSettingsScreen = () => {
  const {data: profilePublicData, refetch: refetchProfile} = useUserProfileQuery();
  const {currentSession, currentUserID} = useSession();
  const tokenData = currentSession?.tokenData || null;
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
      <ScrollView refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View>
          <ListSubheader>Profile Public Data</ListSubheader>
          <DataFieldListItem title={'UserID'} description={currentUserID ?? 'N/A'} />
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
