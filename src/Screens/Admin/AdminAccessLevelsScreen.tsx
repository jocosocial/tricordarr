import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AdminUserManageList} from '#src/Components/Lists/Items/Admin/AdminUserManageList';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDemoteUser, alertPromoteUser} from '#src/Libraries/Alerts/AdminAlerts';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useDemoteUserAccessMutation, usePromoteUserAccessMutation} from '#src/Queries/Admin/UserAccessMutations';
import {useModeratorsQuery, useTHOQuery, useTwitarrTeamQuery} from '#src/Queries/Admin/UserAccessQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminAccessLevelsScreen>;

export const AdminAccessLevelsScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'tho'}>
      <AdminAccessLevelsScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminAccessLevelsScreenInner = ({navigation}: Props) => {
  const {data: moderators, refetch: refetchMods, isLoading: loadingMods} = useModeratorsQuery();
  const {data: twitarrTeam, refetch: refetchTeam, isLoading: loadingTeam} = useTwitarrTeamQuery();
  const {data: tho, refetch: refetchTho, isLoading: loadingTho} = useTHOQuery();
  const {refreshing, onRefresh} = useRefresh({
    refresh: async () => {
      await Promise.all([refetchMods(), refetchTeam(), refetchTho()]);
    },
  });
  const promoteMutation = usePromoteUserAccessMutation();
  const demoteMutation = useDemoteUserAccessMutation();
  const {canPromoteTHO} = useAdminAccess();
  const {setSnackbarPayload} = useSnackbar();
  useAdminHelpButton();

  const openProfile = (user: UserHeader) => {
    navigation.push(CommonStackComponents.userProfileScreen, {userID: user.userID});
  };

  const promote = (user: UserHeader, target: 'moderator' | 'twitarrteam' | 'tho', level: UserAccessLevel) => {
    alertPromoteUser(UserAccessLevel.getLabel(level), user.username, () =>
      promoteMutation.mutate(
        {userID: user.userID, target},
        {
          onSuccess: () => {
            setSnackbarPayload({
              message: `${user.username} promoted to ${UserAccessLevel.getLabel(level)}.`,
              messageType: 'success',
            });
          },
        },
      ),
    );
  };

  const demote = (user: UserHeader) => {
    alertDemoteUser(user.username, () =>
      demoteMutation.mutate(user.userID, {
        onSuccess: () => {
          setSnackbarPayload({message: `${user.username} demoted to Verified.`, messageType: 'success'});
        },
      }),
    );
  };

  if ((loadingMods || loadingTeam || loadingTho) && !moderators && !twitarrTeam && !tho) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Text>
            Only verified users can be promoted. Demote returns a user to Verified. Promoting to THO requires the admin
            account.
          </Text>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Moderators</ListSubheader>
        </ListSection>
        <AdminUserManageList
          users={moderators}
          onPressUser={openProfile}
          onAdd={user => promote(user, 'moderator', UserAccessLevel.moderator)}
          onRemove={demote}
          canModify={true}
          searchTestID={'promoteModerator-search'}
          searchLabel={'Promote to Moderator'}
          emptyText={'No moderators.'}
        />
        <ListSection>
          <ListSubheader>TwitarrTeam</ListSubheader>
        </ListSection>
        <AdminUserManageList
          users={twitarrTeam}
          onPressUser={openProfile}
          onAdd={user => promote(user, 'twitarrteam', UserAccessLevel.twitarrteam)}
          onRemove={demote}
          canModify={true}
          searchTestID={'promoteTwitarrTeam-search'}
          searchLabel={'Promote to TwitarrTeam'}
          emptyText={'No TwitarrTeam members.'}
        />
        <ListSection>
          <ListSubheader>THO</ListSubheader>
        </ListSection>
        <AdminUserManageList
          users={tho}
          onPressUser={openProfile}
          onAdd={user => promote(user, 'tho', UserAccessLevel.tho)}
          onRemove={demote}
          canModify={canPromoteTHO}
          searchTestID={'promoteTHO-search'}
          searchLabel={'Promote to THO'}
          emptyText={'No THO members.'}
        />
      </ScrollingContentView>
    </AppView>
  );
};
