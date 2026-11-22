import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';

import {useAdminHeaderButtons} from '#src/Components/Buttons/HeaderButtons/AdminHeaderButtons';
import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {UserRoleManageView} from '#src/Components/Views/UserRoles/UserRoleManageView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useAddUserRoleMutation, useRemoveUserRoleMutation} from '#src/Queries/Admin/UserRoleMutations';
import {useUsersWithRoleQuery} from '#src/Queries/Admin/UserRoleQueries';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {NoAccessScreen} from '#src/Screens/Checkpoint/NoAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminUserRolesScreen>;

/**
 * Every role THO can assign, derived from the enum so new roles appear without a code change here.
 */
const MANAGED_ROLES: UserRoleType[] = UserRoleType.allCases();

export const AdminUserRolesScreen = (props: Props) => {
  const {hasTHO} = usePrivilege();
  return (
    <LoggedInScreen>
      <NoAccessScreen hasAccess={hasTHO}>
        <AdminUserRolesScreenInner {...props} />
      </NoAccessScreen>
    </LoggedInScreen>
  );
};

const AdminUserRolesScreenInner = ({route, navigation}: Props) => {
  const role = route.params?.role;
  const getNavButtons = useAdminHeaderButtons();

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
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
            <NavigationListItem
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

/**
 * Members of one role, managed through THO's `/admin/userroles` endpoints.
 */
const AdminUserRoleDetail = ({role, navigation}: AdminUserRoleDetailProps) => {
  const {data, refetch, isLoading} = useUsersWithRoleQuery({role});
  const addMutation = useAddUserRoleMutation();
  const removeMutation = useRemoveUserRoleMutation();
  const getNavButtons = useAdminHeaderButtons();

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <UserRoleManageView
      roleName={UserRoleType.getLabel(role)}
      users={data}
      isLoading={isLoading}
      refetch={refetch}
      addRole={user => addMutation.mutateAsync({role, user})}
      removeRole={user => removeMutation.mutateAsync({role, user})}
      busy={addMutation.isPending || removeMutation.isPending}
    />
  );
};
