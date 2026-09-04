import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorRootScreen>;

const ModeratorRootScreenInner = () => {
  const {data, refetch} = useUserNotificationDataQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useModerationHelpHeader();

  const moderatorData = data?.moderatorData;

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View>
          <Divider bold={true} />
          <ListSection>
            <NavigationListItem
              title={'Open Reports'}
              description={'Reports that still need a moderator decision.'}
              navComponent={CommonStackComponents.moderatorReportsScreen}
              params={{closed: false}}
              unreadCount={moderatorData?.openReportCount}
            />
            <NavigationListItem
              title={'Closed Reports'}
              description={'Reports that have already been actioned.'}
              navComponent={CommonStackComponents.moderatorReportsScreen}
              params={{closed: true}}
            />
            <NavigationListItem
              title={'Moderator Log'}
              description={'History of moderator actions on content and users.'}
              navComponent={CommonStackComponents.moderatorLogScreen}
            />
            <NavigationListItem
              title={'Seamail to @moderator'}
              description={'Seamails where @moderator is a participant.'}
              navComponent={CommonStackComponents.seamailListScreen}
              params={{asPrivilegedUser: PrivilegedUserAccounts.moderator, noDrawer: true}}
              unreadCount={moderatorData?.newModeratorSeamailMessageCount}
            />
            <NavigationListItem
              title={'Forum Mentions of @moderator'}
              description={'Forum posts that mention @moderator.'}
              navComponent={CommonStackComponents.forumPostMentionScreen}
              params={{asPrivilegedUser: PrivilegedUserAccounts.moderator}}
              unreadCount={moderatorData?.newModeratorForumMentionCount}
            />
            <NavigationListItem
              title={'Micro Karaoke'}
              description={'Review clips and approve completed songs.'}
              navComponent={CommonStackComponents.microKaraokeSongsModerateScreen}
            />
            <NavigationListItem
              title={'Moderator Guide'}
              description={'In-app copy of the Swiftarr moderator handbook.'}
              navComponent={CommonStackComponents.moderatorGuideScreen}
            />
          </ListSection>
        </View>
      </ScrollingContentView>
    </AppView>
  );
};

export const ModeratorRootScreen = (_props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratorRootScreenInner />
    </ModeratorFeatureScreen>
  );
};
