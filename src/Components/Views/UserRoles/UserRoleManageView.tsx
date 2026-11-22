import React from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AdminUserManageList} from '#src/Components/Lists/Items/Admin/AdminUserManageList';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertPromoteUser, alertRemoveRole} from '#src/Libraries/Alerts/AdminAlerts';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserRoleManageViewProps {
  roleName: string;
  users: UserHeader[] | undefined;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  /** Grants the role. Resolves on success; rejects on failure (the mutation hook reports the error). */
  addRole: (user: UserHeader) => Promise<unknown>;
  /** Revokes the role. Resolves on success; rejects on failure (the mutation hook reports the error). */
  removeRole: (user: UserHeader) => Promise<unknown>;
  /** TRUE while an add or remove is in flight. */
  busy: boolean;
}

/**
 * Lists the users holding a role and lets the viewer grant or revoke it. Shared by THO's role admin
 * and the Shutternaut Manager's Shutternaut management, which use different endpoints.
 */
export const UserRoleManageView = ({
  roleName,
  users,
  isLoading,
  refetch,
  addRole,
  removeRole,
  busy,
}: UserRoleManageViewProps) => {
  const navigation = useCommonStack();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {setSnackbarPayload} = useSnackbar();

  const openProfile = (user: UserHeader) => {
    navigation.push(CommonStackComponents.userProfileScreen, {userID: user.userID});
  };

  /**
   * Confirms, then grants the role.
   */
  const onAdd = (user: UserHeader) => {
    alertPromoteUser(roleName, user.username, async () => {
      try {
        await addRole(user);
      } catch {
        // useTokenAuthMutation already shows the error.
        return;
      }
      setSnackbarPayload({message: `${roleName} added to ${user.username}.`, messageType: 'success'});
    });
  };

  /**
   * Confirms, then revokes the role.
   */
  const onRemove = (user: UserHeader) => {
    alertRemoveRole(roleName, user.username, async () => {
      try {
        await removeRole(user);
      } catch {
        // useTokenAuthMutation already shows the error.
        return;
      }
      setSnackbarPayload({message: `${roleName} removed from ${user.username}.`, messageType: 'success'});
    });
  };

  if (isLoading && !users) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <AdminUserManageList
          users={users}
          onPressUser={openProfile}
          onAdd={onAdd}
          onRemove={onRemove}
          canModify={true}
          busy={busy}
          searchTestID={'addRole-search'}
          searchLabel={`Add ${roleName}`}
          emptyText={`No users have the ${roleName} role.`}
        />
      </ScrollingContentView>
    </AppView>
  );
};
