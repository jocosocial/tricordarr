import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import pluralize from 'pluralize';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

import {ForumCategoryFAB} from '#src/Components/Buttons/FloatingActionButtons/ForumCategoryFAB';
import {ForumSelectionHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ForumSelectionHeaderButtons';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ForumCategoryScreenActionsMenu} from '#src/Components/Menus/Forum/ForumCategoryScreenActionsMenu';
import {ForumCategoryScreenSearchMenu} from '#src/Components/Menus/Forum/ForumCategoryScreenSearchMenu';
import {ForumThreadScreenFilterMenu} from '#src/Components/Menus/Forum/ForumThreadScreenFilterMenu';
import {ForumThreadScreenSortMenu} from '#src/Components/Menus/Forum/ForumThreadScreenSortMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ForumEmptyListView} from '#src/Components/Views/Forum/ForumEmptyListView';
import {ForumThreadListView} from '#src/Components/Views/Forum/ForumThreadListView';
import {ForumThreadsRelationsView} from '#src/Components/Views/Forum/ForumThreadsRelationsView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {ForumFilter} from '#src/Enums/ForumSortFilter';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {useForumCategoryQuery} from '#src/Queries/Forum/ForumCategoryQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumListData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumCategoryScreen>;

export const ForumCategoryScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen>
        <DisabledFeatureScreen
          feature={SwiftarrFeature.forums}
          urlPath={`/forums/${props.route.params.category.categoryID}`}>
          <ForumCategoryScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const ForumCategoryScreenInner = ({route, navigation}: Props) => {
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
        <MaterialHeaderButtons>
          <ForumCategoryScreenSearchMenu category={route.params.category} />
          <ForumThreadScreenSortMenu category={route.params.category} />
          <ForumThreadScreenFilterMenu />
          <ForumCategoryScreenActionsMenu />
        </MaterialHeaderButtons>
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
