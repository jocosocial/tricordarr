import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';

import {useAdminHeaderButtons} from '#src/Components/Buttons/HeaderButtons/AdminHeaderButtons';
import {UserRoleManageView} from '#src/Components/Views/UserRoles/UserRoleManageView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useAddShutternautMutation, useRemoveShutternautMutation} from '#src/Queries/Admin/UserRoleMutations';
import {useShutternautsQuery} from '#src/Queries/Admin/UserRoleQueries';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {NoAccessScreen} from '#src/Screens/Checkpoint/NoAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.shutternautManageScreen>;

/**
 * Lets a Shutternaut Manager grant and revoke the Shutternaut role. Native counterpart to Swiftarr's
 * `/userrole/shutternaut/manage`.
 *
 * Open to Shutternaut Managers and TwitarrTeam and above, matching the rest of the Shutternaut
 * hub. Swiftarr's `/users/userrole/shutternaut` currently checks for the `shutternautmanager` role
 * only, so TwitarrTeam without that role will get an error until the API allows them.
 * THO can also manage roles through Server Admin.
 *
 * No PreRegistrationScreen checkpoint: Swiftarr marks the site route `setUsedForPreregistration()`.
 */
export const ShutternautManageScreen = (props: Props) => {
  const {hasShutternautManager} = useRoles();
  const {hasTwitarrTeam} = usePrivilege();

  return (
    <LoggedInScreen>
      <NoAccessScreen hasAccess={hasShutternautManager || hasTwitarrTeam}>
        <ShutternautManageScreenInner {...props} />
      </NoAccessScreen>
    </LoggedInScreen>
  );
};

const ShutternautManageScreenInner = ({navigation}: Props) => {
  const {data, refetch, isLoading} = useShutternautsQuery();
  const addMutation = useAddShutternautMutation();
  const removeMutation = useRemoveShutternautMutation();
  const getNavButtons = useAdminHeaderButtons(CommonStackComponents.shutternautHelpScreen);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <UserRoleManageView
      roleName={UserRoleType.getLabel(UserRoleType.shutternaut)}
      users={data}
      isLoading={isLoading}
      refetch={refetch}
      addRole={user => addMutation.mutateAsync({userID: user.userID})}
      removeRole={user => removeMutation.mutateAsync({userID: user.userID})}
      busy={addMutation.isPending || removeMutation.isPending}
    />
  );
};
