import React, {useCallback, useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator.tsx';
import {View} from 'react-native';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {ForumThreadScreenFilterMenu} from '../../Menus/Forum/ForumThreadScreenFilterMenu.tsx';
import {ForumThreadScreenSortMenu} from '../../Menus/Forum/ForumThreadScreenSortMenu.tsx';
import {useFilter} from '../../Context/Contexts/FilterContext.ts';
import {ForumThreadsRelationsView} from '../../Views/Forum/ForumThreadsRelationsView.tsx';
import {useIsFocused} from '@react-navigation/native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {AppView} from '../../Views/AppView.tsx';
import {ForumFilter} from '../../../Libraries/Enums/ForumSortFilter.ts';
import {ForumCategoryScreenActionsMenu} from '../../Menus/Forum/ForumCategoryScreenActionsMenu.tsx';
import {useForumCategoryQuery} from '../../Queries/Forum/ForumCategoryQueries.ts';
import {ForumListData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';
import {ForumThreadListView} from '../../Views/Forum/ForumThreadListView.tsx';
import {ForumEmptyListView} from '../../Views/Forum/ForumEmptyListView.tsx';
import {ForumCategoryFAB} from '../../Buttons/FloatingActionButtons/ForumCategoryFAB.tsx';
import {ForumSelectionHeaderButtons} from '../../Buttons/HeaderButtons/ForumSelectionHeaderButtons.tsx';
import {ForumCategoryScreenSearchMenu} from '../../Menus/Forum/ForumCategoryScreenSearchMenu.tsx';
import pluralize from 'pluralize';

type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumCategoryScreen>;

export const ForumCategoryScreen = ({route, navigation}: Props) => {
  const {forumFilter} = useFilter();
  const isFocused = useIsFocused();
  const {clearPrivileges} = usePrivilege();
  const {forumSortOrder, forumSortDirection} = useFilter();
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
  } = useForumCategoryQuery(route.params.category.categoryID, {
    ...(forumSortOrder ? {sort: forumSortOrder} : undefined),
    ...(forumSortDirection ? {order: forumSortDirection} : undefined),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [forumListData, setForumListData] = useState<ForumListData[]>([]);
  const [isUserRestricted, setIsUserRestricted] = useState(false);
  const {hasModerator} = usePrivilege();
  const {selectedForums, enableSelection} = useSelection();

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
          <ForumSelectionHeaderButtons setRefreshing={setRefreshing} categoryID={route.params.category.categoryID} />
        </View>
      );
    }
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumCategoryScreenSearchMenu category={route.params.category} />
          <ForumThreadScreenSortMenu category={route.params.category} />
          <ForumThreadScreenFilterMenu />
          <ForumCategoryScreenActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, [enableSelection, route.params.category]);

  useEffect(() => {
    // This clears the previous state of forum posts and a specific forum.
    if (isFocused) {
      clearPrivileges();
    }
    navigation.setOptions({
      headerRight: getNavButtons,
    });
    if (enableSelection) {
      navigation.setOptions({title: `Selected: ${selectedForums.length}`});
    } else {
      navigation.setOptions({title: 'Forums'});
    }
  }, [isFocused, getNavButtons, navigation, clearPrivileges, enableSelection, selectedForums.length]);

  if (isLoading || !data) {
    return <LoadingView />;
  }

  if (data?.pages[0].paginator.total === 0 && forumListData.length === 0) {
    return (
      <AppView>
        <ForumEmptyListView onRefresh={onRefresh} refreshing={refreshing} />
        {!isUserRestricted && <ForumCategoryFAB category={route.params.category} />}
      </AppView>
    );
  }

  if (forumFilter) {
    return (
      <AppView>
        <ForumThreadsRelationsView
          relationType={ForumFilter.toRelation(forumFilter)}
          category={route.params.category}
          title={route.params.category.title}
        />
        {!isUserRestricted && <ForumCategoryFAB category={route.params.category} />}
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
        category={route.params.category}
        isFetchingPreviousPage={isFetchingPreviousPage}
        isFetchingNextPage={isFetchingNextPage}
        refreshing={refreshing}
        onRefresh={onRefresh}
        setRefreshing={setRefreshing}
        enableFAB={!isUserRestricted}
        title={route.params.category.title}
        subtitle={`${data.pages[0].paginator.total} ${pluralize('forum', data.pages[0].paginator.total)}`}
      />
    </AppView>
  );
};
