import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../../libraries/Enums/Navigation';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumListDataActions} from '../../../Reducers/Forum/ForumListDataReducer';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {RefreshControl} from 'react-native';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {ForumThreadFlatList} from '../../../Lists/Forums/ForumThreadFlatList';
import {ForumFAB} from '../../../Buttons/FloatingActionButtons/ForumFAB';
import {useForumSearchQuery} from '../../../Queries/Forum/ForumSearchQueries';
import {ListTitleView} from '../../../Views/ListTitleView';
import {UserHeader} from '../../../../libraries/Structs/ControllerStructs';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumThreadUserScreen,
  NavigatorIDs.forumStack
>;

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
  const {forumListDataUser, dispatchForumListDataUser} = useTwitarr();

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
      dispatchForumListDataUser({
        type: ForumListDataActions.setList,
        threadList: data.pages.flatMap(p => p.forumThreads || []),
      });
    }
  }, [data, dispatchForumListDataUser]);

  if (!data) {
    return <LoadingView />;
  }

  if (forumListDataUser.length === 0) {
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
      <ListTitleView title={`Forums by ${UserHeader.getByline(route.params.user)}`} />
      <ForumThreadFlatList
        forumListData={forumListDataUser}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
      <ForumFAB />
    </AppView>
  );
};
