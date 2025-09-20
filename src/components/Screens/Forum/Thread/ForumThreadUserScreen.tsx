import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LoadingView} from '../../../Views/Static/LoadingView.tsx';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {RefreshControl} from 'react-native';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {Text} from 'react-native-paper';
import {ForumThreadFlatList} from '../../../Lists/Forums/ForumThreadFlatList.tsx';
import {useForumSearchQuery} from '../../../Queries/Forum/ForumThreadSearchQueries.ts';
import {ListTitleView} from '../../../Views/ListTitleView.tsx';
import {getUserBylineString} from '../../../Text/Tags/UserBylineTag.tsx';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens.tsx';
import {ForumListData} from '../../../../Libraries/Structs/ControllerStructs.tsx';

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
  const [forumListData, setForumListData] = useState<ForumListData[]>([]);

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
    if (data && data.pages) {
      setForumListData(data.pages.flatMap(p => p.forumThreads || []));
    }
  }, [data, setForumListData]);

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
