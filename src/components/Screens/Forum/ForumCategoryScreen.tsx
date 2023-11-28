import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {useForumCategoryQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {Text} from 'react-native-paper';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumThreadFAB} from '../../Buttons/FloatingActionButtons/ForumThreadFAB';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';
import {ForumThreadFlatList} from '../../Lists/Forums/ForumThreadFlatList';
import {ForumThreadFilterMenu} from '../../Menus/Forum/ForumThreadFilterMenu';
import {ForumThreadSortMenu} from '../../Menus/Forum/ForumThreadSortMenu';
import {useFilter} from '../../Context/Contexts/FilterContext';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumCategoryScreen,
  NavigatorIDs.forumStack
>;

export const ForumCategoryScreen = ({route, navigation}: Props) => {
  const {forumSortOrder} = useFilter();
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
  } = useForumCategoryQuery(route.params.categoryId, {
    sort: forumSortOrder,
  });
  const [refreshing, setRefreshing] = useState(false);
  const {forumListData, dispatchForumListData} = useTwitarr();

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

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumThreadSortMenu />
          <ForumThreadFilterMenu />
          <Item title={'Help'} iconName={AppIcons.help} onPress={() => console.log('help')} />
        </HeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    if (data && data.pages) {
      dispatchForumListData({
        type: ForumListDataActions.setList,
        threadList: data.pages.flatMap(p => p.forumThreads || []),
      });
    }
  }, [data, dispatchForumListData, route.params.categoryId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

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
            <Text>There aren't any forums in this category yet.</Text>
          </PaddedContentView>
        </ScrollingContentView>
      </AppView>
    );
  }

  return (
    <AppView>
      <ForumThreadFlatList
        forumListData={forumListData}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
      />
      <ForumThreadFAB />
    </AppView>
  );
};
