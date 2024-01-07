import {AppView} from '../../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import {ForumPostFlatList} from '../../../Lists/Forums/ForumPostFlatList';
import React, {useEffect, useRef, useState} from 'react';
import {useForumPostSearchQuery} from '../../../Queries/Forum/ForumPostSearchQueries';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../../Reducers/Forum/ForumPostListReducer';
import {useIsFocused} from '@react-navigation/native';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {ListTitleView} from '../../../Views/ListTitleView';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';
import {UserNotificationDataActions} from '../../../Reducers/Notification/UserNotificationDataReducer';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumPostAlertwordScreen,
  NavigatorIDs.forumStack
>;

export const ForumPostAlertwordScreen = ({route}: Props) => {
  const {
    data,
    refetch,
    hasNextPage,
    hasPreviousPage,
    fetchPreviousPage,
    fetchNextPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    isFetching,
  } = useForumPostSearchQuery({
    search: route.params.alertWord,
  });
  const {commonStyles} = useStyles();
  const {forumPosts, dispatchForumPosts} = useTwitarr();
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList<PostData>>(null);
  const {dispatchUserNotificationData} = useUserNotificationData();

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      setRefreshing(true);
      fetchNextPage().finally(() => setRefreshing(false));
    }
  };
  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => setRefreshing(false));
    }
  };

  useEffect(() => {
    if (data && data.pages && isFocused) {
      dispatchForumPosts({
        type: ForumPostListActions.setList,
        postList: data.pages.flatMap(p => p.posts),
      });
      dispatchUserNotificationData({
        type: UserNotificationDataActions.markAlertwordRead,
        alertWord: route.params.alertWord,
      });
    }
  }, [data, dispatchForumPosts, isFocused, dispatchUserNotificationData, route.params.alertWord]);

  return (
    <AppView>
      <ListTitleView title={route.params.alertWord} />
      <View style={[commonStyles.flex]}>
        <ForumPostFlatList
          flatListRef={flatListRef}
          refreshControl={<RefreshControl refreshing={isFetching || refreshing} onRefresh={refetch} />}
          postList={forumPosts}
          handleLoadNext={handleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          itemSeparator={'time'}
          invertList={false}
          enableShowInThread={true}
          hasNextPage={hasNextPage}
        />
      </View>
    </AppView>
  );
};
