import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListItem} from '#src/Components/Lists/ListItem';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ModeratorActionType} from '#src/Enums/ModeratorActionType';
import {ReportType} from '#src/Enums/ReportType';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {timeAgo} from '#src/Libraries/DateTime';
import {pushModerateScreen} from '#src/Libraries/ModerationNavigation';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useModerationLogQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {ModeratorActionLogData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorLogScreen>;

const ModeratorLogScreenInner = () => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  const {data, refetch, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} = useModerationLogQuery();
  const {refreshing, setRefreshing, onRefresh} = useRefresh({refresh: refetch});
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    setRefreshing,
  });
  useModerationHelpHeader();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        list: {
          ...commonStyles.flex,
        },
        empty: {
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles],
  );

  const actions = useMemo(() => data?.pages.flatMap(page => page.actions) ?? [], [data]);

  const onPressAction = (action: ModeratorActionLogData) => {
    if (action.contentType === ReportType.userProfile) {
      navigation.push(CommonStackComponents.userModerateScreen, {id: action.contentID});
      return;
    }
    pushModerateScreen(navigation, action.contentType, action.contentID);
  };

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <AppView>
      <FlatList
        style={styles.list}
        data={actions}
        keyExtractor={item => item.id}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
        ListEmptyComponent={
          <PaddedContentView>
            <Text style={styles.empty}>No moderator actions have been logged yet.</Text>
          </PaddedContentView>
        }
        renderItem={({item}) => (
          <ListItem
            title={`@${item.moderator.username}: ${ModeratorActionType.getLabel(item.actionType)}`}
            description={`@${item.targetUser.username}'s ${ReportType.getLabel(item.contentType)}\n${timeAgo.format(new Date(item.timestamp))}`}
            descriptionNumberOfLines={3}
            onPress={() => onPressAction(item)}
          />
        )}
      />
    </AppView>
  );
};

export const ModeratorLogScreen = (_props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratorLogScreenInner />
    </ModeratorFeatureScreen>
  );
};
