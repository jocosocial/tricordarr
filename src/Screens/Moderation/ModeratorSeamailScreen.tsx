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
import {FezType} from '#src/Enums/FezType';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezListQuery} from '#src/Queries/Fez/FezQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {FezData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorSeamailScreen>;

const ModeratorSeamailScreenInner = () => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  const {data, refetch, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} = useFezListQuery({
    endpoint: 'joined',
    forUser: 'moderator',
  });
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

  const fezzes = useMemo(() => data?.pages.flatMap(page => page.fezzes) ?? [], [data]);

  const onPressFez = (fez: FezData) => {
    navigation.push(FezType.getChatScreen(fez.fezType), {fezID: fez.fezID});
  };

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <AppView>
      <FlatList
        style={styles.list}
        data={fezzes}
        keyExtractor={item => item.fezID}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
        ListEmptyComponent={
          <PaddedContentView>
            <Text style={styles.empty}>No seamails involving @moderator.</Text>
          </PaddedContentView>
        }
        renderItem={({item}) => {
          const unread =
            item.members && item.members.postCount - item.members.readCount > 0
              ? item.members.postCount - item.members.readCount
              : 0;
          return (
            <ListItem
              title={item.title}
              description={unread ? `${unread} unread` : FezType.getLabel(item.fezType)}
              onPress={() => onPressFez(item)}
            />
          );
        }}
      />
    </AppView>
  );
};

export const ModeratorSeamailScreen = (_props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratorSeamailScreenInner />
    </ModeratorFeatureScreen>
  );
};
