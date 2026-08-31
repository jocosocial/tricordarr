import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AdminNavigationListItem} from '#src/Components/Lists/Items/Admin/AdminNavigationListItem';
import {AdminUserManageList} from '#src/Components/Lists/Items/Admin/AdminUserManageList';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertPromoteUser, alertRemoveRole} from '#src/Libraries/Alerts/AdminAlerts';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useAddUserRoleMutation, useRemoveUserRoleMutation} from '#src/Queries/Admin/UserRoleMutations';
import {useUsersWithRoleQuery} from '#src/Queries/Admin/UserRoleQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminUserRolesScreen>;

const MANAGED_ROLES: UserRoleType[] = [
  UserRoleType.accountmanager,
  UserRoleType.karaokemanager,
  UserRoleType.karaokeambassador,
  UserRoleType.shutternaut,
  UserRoleType.shutternautmanager,
  UserRoleType.performerselfeditor,
];

export const AdminUserRolesScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'tho'}>
      <AdminUserRolesScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminUserRolesScreenInner = ({route, navigation}: Props) => {
  const role = route.params?.role;
  useAdminHelpButton();

  React.useEffect(() => {
    navigation.setOptions({title: role ? UserRoleType.getLabel(role) : 'User Roles'});
  }, [navigation, role]);

  if (!role) {
    return (
      <AppView>
        <ScrollingContentView isStack={true}>
          <ListSection>
            <ListSubheader>User Roles</ListSubheader>
          </ListSection>
          {MANAGED_ROLES.map(managedRole => (
            <AdminNavigationListItem
              key={managedRole}
              title={UserRoleType.getLabel(managedRole)}
              description={`Users with the ${UserRoleType.getLabel(managedRole)} role.`}
              navComponent={CommonStackComponents.adminUserRolesScreen}
              params={{role: managedRole}}
            />
          ))}
        </ScrollingContentView>
      </AppView>
    );
  }

  return <AdminUserRoleDetail role={role} navigation={navigation} />;
};

interface AdminUserRoleDetailProps {
  role: UserRoleType;
  navigation: Props['navigation'];
}

const AdminUserRoleDetail = ({role, navigation}: AdminUserRoleDetailProps) => {
  const {data, refetch, isLoading} = useUsersWithRoleQuery({role});
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const addMutation = useAddUserRoleMutation();
  const removeMutation = useRemoveUserRoleMutation();
  const {setSnackbarPayload} = useSnackbar();
  const roleName = UserRoleType.getLabel(role);
  useAdminHelpButton();

  const openProfile = (user: UserHeader) => {
    navigation.push(CommonStackComponents.userProfileScreen, {userID: user.userID});
  };

  const addRole = (user: UserHeader) => {
    alertPromoteUser(roleName, user.username, () =>
      addMutation.mutate(
        {role, userID: user.userID},
        {
          onSuccess: () => {
            setSnackbarPayload({message: `${roleName} added to ${user.username}.`, messageType: 'success'});
          },
        },
      ),
    );
  };

  const removeRole = (user: UserHeader) => {
    alertRemoveRole(roleName, user.username, () =>
      removeMutation.mutate(
        {role, userID: user.userID},
        {
          onSuccess: () => {
            setSnackbarPayload({message: `${roleName} removed from ${user.username}.`, messageType: 'success'});
          },
        },
      ),
    );
  };

  if (isLoading && !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Text>Assign or remove the {roleName} role. Users may hold multiple roles.</Text>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>{roleName}</ListSubheader>
        </ListSection>
        <AdminUserManageList
          users={data}
          onPressUser={openProfile}
          onAdd={addRole}
          onRemove={removeRole}
          canModify={true}
          searchTestID={'addRole-search'}
          searchLabel={`Add ${roleName}`}
          emptyText={`No users have the ${roleName} role.`}
        />
      </ScrollingContentView>
    </AppView>
  );
};
