import React, {useCallback, useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {View} from 'react-native';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {ForumThreadScreenFilterMenu} from '../../Menus/Forum/ForumThreadScreenFilterMenu';
import {ForumThreadScreenSortMenu} from '../../Menus/Forum/ForumThreadScreenSortMenu';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ForumThreadsRelationsView} from '../../Views/Forum/ForumThreadsRelationsView';
import {useIsFocused} from '@react-navigation/native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {AppView} from '../../Views/AppView';
import {ForumFilter} from '../../../libraries/Enums/ForumSortFilter';
import {ForumCategoryScreenActionsMenu} from '../../Menus/Forum/ForumCategoryScreenActionsMenu.tsx';
import {useForumCategoryQuery} from '../../Queries/Forum/ForumCategoryQueries.tsx';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';
import {ForumThreadListView} from '../../Views/Forum/ForumThreadListView.tsx';
import {ForumCategoryEmptyView} from '../../Views/Forum/ForumCategoryEmptyView.tsx';

type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumCategoryScreen>;

export const ForumCategoryScreen = ({route, navigation}: Props) => {
  const {forumFilter} = useFilter();
  const isFocused = useIsFocused();
  const {clearPrivileges} = usePrivilege();
  const {forumSortOrder} = useFilter();
  const {
    data,
    refetch,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useForumCategoryQuery(route.params.categoryID, {
    ...(forumSortOrder ? {sort: forumSortOrder} : undefined),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [forumListData, setForumListData] = useState<ForumListData[]>([]);
  const [isUserRestricted, setIsUserRestricted] = useState(false);
  const {hasModerator} = usePrivilege();
  const {selectedItems, enableSelection} = useSelection<ForumListData>();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    if (data && data.pages) {
      setForumListData(data.pages.flatMap(p => p.forumThreads || []));

      const categoryData = data.pages[0];
      if (hasModerator) {
        setIsUserRestricted(false);
      } else {
        setIsUserRestricted(categoryData.isEventCategory || categoryData.isRestricted);
      }
    }
  }, [data, setForumListData, hasModerator]);

  const getNavButtons = useCallback(() => {
    if (enableSelection) {
      return (
        <View>
          <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
            <Item iconName={AppIcons.favorite} title={'Favorite'} />
            <Item iconName={AppIcons.mute} title={'Mute'} />
            <Item iconName={AppIcons.markAsRead} title={'Read'} />
          </HeaderButtons>
        </View>
      );
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumThreadScreenSortMenu />
          <ForumThreadScreenFilterMenu />
          <ForumCategoryScreenActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, [enableSelection]);

  useEffect(() => {
    // This clears the previous state of forum posts and a specific forum.
    if (isFocused) {
      clearPrivileges();
    }
    navigation.setOptions({
      headerRight: getNavButtons,
    });
    if (enableSelection) {
      navigation.setOptions({title: `Selected: ${selectedItems.length}`});
    } else {
      navigation.setOptions({title: 'Forums'});
    }
  }, [isFocused, getNavButtons, navigation, clearPrivileges, enableSelection, selectedItems.length]);

  if (isLoading) {
    return <LoadingView />;
  }

  if (data?.pages[0].numThreads === 0 && forumListData.length === 0) {
    return (
      <AppView>
        <ForumCategoryEmptyView
          categoryID={route.params.categoryID}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showFAB={!isUserRestricted}
        />
      </AppView>
    );
  }

  if (forumFilter) {
    return (
      <AppView>
        <ForumThreadsRelationsView
          relationType={ForumFilter.toRelation(forumFilter)}
          categoryID={route.params.categoryID}
        />
      </AppView>
    );
  }

  return (
    <AppView>
      <ForumThreadListView
        fetchPreviousPage={fetchPreviousPage}
        fetchNextPage={fetchNextPage}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        forumListData={forumListData}
        categoryID={route.params.categoryID}
        isFetchingPreviousPage={isFetchingPreviousPage}
        title={data?.pages[0].title}
        isFetchingNextPage={isFetchingNextPage}
        refreshing={refreshing}
        onRefresh={onRefresh}
        setRefreshing={setRefreshing}
        enableFAB={!isUserRestricted}
      />
    </AppView>
  );
};
