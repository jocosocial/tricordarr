import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentAuthorSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentAuthorSectionView';
import {ModerationUserAccessSectionView} from '#src/Components/Views/Moderation/Content/ModerationUserAccessSectionView';
import {ModerationUserAlternateAccountsSectionView} from '#src/Components/Views/Moderation/Content/ModerationUserAlternateAccountsSectionView';
import {ModerationReportsSection} from '#src/Components/Views/Moderation/ModerationReportsSection';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {AppIcons} from '#src/Enums/Icons';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUserModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {UserModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateUserScreen>;

const ModerateUserScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {data, refetch, isLoading} = useUserModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(UserModerationData.getCacheKeys(id));
  const getNavButtons = useModerationHeaderButtons({
    contentType: ShareContentType.user,
    contentID: id,
    contentIcon: AppIcons.user,
    moderateType: ShareContentType.userModerate,
    moderateID: id,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Content</ListSubheader>
        </ListSection>
        <UserListItem
          userHeader={data.header}
          onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: data.header.userID})}
        />
        <ModerationUserAccessSectionView
          userID={id}
          accessLevel={data.accessLevel}
          tempQuarantineEndTime={data.tempQuarantineEndTime}
          testIDPrefix={'userModerate'}
        />
        <ModerationUserAlternateAccountsSectionView accounts={data.subAccounts} />
        <ModerationReportsSection reports={data.reports} />
        <ModerationContentAuthorSectionView>
          <NavigationListItem
            title={'All Forum Threads'}
            description={'View all forums by this user.'}
            onPress={() => navigation.push(CommonStackComponents.forumThreadUserScreen, {user: data.header})}
          />
          <NavigationListItem
            title={'All Photostream'}
            description={'View all photostream photos by this user.'}
            onPress={() => navigation.push(CommonStackComponents.photostreamUserScreen, {user: data.header})}
          />
          <NavigationListItem
            title={'All Forum Posts'}
            description={'View all forum posts by this user.'}
            onPress={() => navigation.push(CommonStackComponents.forumPostUserScreen, {user: data.header})}
          />
        </ModerationContentAuthorSectionView>
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        testIDPrefix={'userModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModerateUserScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateUserScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
