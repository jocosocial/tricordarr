import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Divider, Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListItem} from '#src/Components/Lists/ListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorRootScreen>;

const ModeratorRootScreenInner = () => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  const {data, refetch} = useUserNotificationDataQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useModerationHelpHeader();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        caption: {
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles],
  );

  const moderatorData = data?.moderatorData;

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text variant={'bodyMedium'} style={styles.caption}>
            Reports, logs, and in-app moderation tools. Use these instead of the Twitarr web UI when you can.
          </Text>
        </PaddedContentView>
        <View>
          <Divider bold={true} />
          <ListSection>
            <ListItem
              title={
                moderatorData?.openReportCount ? `Open Reports (${moderatorData.openReportCount})` : 'Open Reports'
              }
              description={'Reports that still need a moderator decision.'}
              onPress={() =>
                navigation.push(CommonStackComponents.moderatorReportsScreen, {
                  closed: false,
                })
              }
            />
            <ListItem
              title={'Closed Reports'}
              description={'Reports that have already been actioned.'}
              onPress={() =>
                navigation.push(CommonStackComponents.moderatorReportsScreen, {
                  closed: true,
                })
              }
            />
            <ListItem
              title={'Moderator Log'}
              description={'History of moderator actions on content and users.'}
              onPress={() => navigation.push(CommonStackComponents.moderatorLogScreen)}
            />
            <ListItem
              title={
                moderatorData?.newModeratorSeamailMessageCount
                  ? `Seamail to @moderator (${moderatorData.newModeratorSeamailMessageCount})`
                  : 'Seamail to @moderator'
              }
              description={'Seamails where @moderator is a participant.'}
              onPress={() => navigation.push(CommonStackComponents.moderatorSeamailScreen)}
            />
            <ListItem
              title={
                moderatorData?.newModeratorForumMentionCount
                  ? `Forum Mentions of @moderator (${moderatorData.newModeratorForumMentionCount})`
                  : 'Forum Mentions of @moderator'
              }
              description={'Forum posts that mention @moderator.'}
              onPress={() => navigation.push(CommonStackComponents.moderatorForumMentionsScreen)}
            />
            <ListItem
              title={'Micro Karaoke'}
              description={'Review clips and approve completed songs.'}
              onPress={() => navigation.push(CommonStackComponents.microKaraokeSongsModerateScreen)}
            />
            <ListItem
              title={'Moderator Guide'}
              description={'In-app copy of the Swiftarr moderator handbook.'}
              onPress={() => navigation.push(CommonStackComponents.moderatorGuideScreen)}
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
