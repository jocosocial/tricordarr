import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumListDataActions} from '../../../Reducers/Forum/ForumListDataReducer';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {RefreshControl} from 'react-native';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {ForumThreadFlatList} from '../../../Lists/Forums/ForumThreadFlatList';
import {useForumSearchQuery} from '../../../Queries/Forum/ForumSearchQueries';
import {ListTitleView} from '../../../Views/ListTitleView';
import {useIsFocused} from '@react-navigation/native';
import {getUserBylineString} from '../../../Text/Tags/UserBylineTag';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadUserScreen>;

export const ForumThreadUserScreen = ({route}: Props) => {
  const {
    data,
    refetch,
    isLoading,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useForumSearchQuery({
    creatorid: route.params.user.userID,
  });
  const [refreshing, setRefreshing] = useState(false);
  // const [forumListData, dispatchForumListData] = useForumListDataReducer([]);
  const {forumListData, dispatchForumListData} = useTwitarr();
  const isFocused = useIsFocused();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

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
      dispatchForumListData({
        type: ForumListDataActions.setList,
        threadList: data.pages.flatMap(p => p.forumThreads || []),
      });
    }
  }, [data, dispatchForumListData, isFocused]);

  if (!data) {
    return <LoadingView />;
  }

  if (forumListData.length === 0) {
    return (
      <AppView>
        <ScrollingContentView
          isStack={true}
          refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}>
          <PaddedContentView padTop={true}>
            <Text>There aren't any forums created by this user.</Text>
          </PaddedContentView>
        </ScrollingContentView>
      </AppView>
    );
  }

  return (
    <AppView>
      <ListTitleView title={getUserBylineString(route.params.user, false, true, 'Forums by')} />
      <ForumThreadFlatList
        forumListData={forumListData}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </AppView>
  );
};
