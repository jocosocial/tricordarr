import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import pluralize from 'pluralize';
import React, {useCallback, useEffect} from 'react';
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
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useForumFilter} from '#src/Context/Contexts/ForumFilterContext';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {SelectionProvider} from '#src/Context/Providers/SelectionProvider';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {ForumFilter} from '#src/Enums/ForumSortFilter';
import {useForumListData} from '#src/Hooks/Forum/useForumListData';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {useForumCategoryQuery} from '#src/Queries/Forum/ForumCategoryQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumCategoryScreen>;

/**
 * Forum category thread list. Takes `categoryID` only so in-app navigation and
 * `/forums/:categoryID` deep links share the same param shape; CategoryData comes from the query.
 */
export const ForumCategoryScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.forumCategoryHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={`/forums/${props.route.params.categoryID}`}>
          <SelectionProvider>
            <ForumCategoryScreenInner {...props} />
          </SelectionProvider>
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Loads threads for `route.params.categoryID` and renders the category list, filters, and FAB.
 */
const ForumCategoryScreenInner = ({route, navigation}: Props) => {
  const {forumFilter, forumSortOrder, forumSortDirection} = useForumFilter();
  const isFocused = useIsFocused();
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
    isFetching,
  } = useForumCategoryQuery(route.params.categoryID, {
    ...(forumSortOrder ? {sort: forumSortOrder} : undefined),
    ...(forumSortDirection ? {order: forumSortDirection} : undefined),
  });
  const {forumListData, isUserRestricted} = useForumListData(data);
  const {selectedItems, enableSelection} = useSelection();
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
    isRefreshing: isFetching,
  });
  const category = data?.pages[0];

  const getNavButtons = useCallback(() => {
    if (enableSelection) {
      return (
        <View>
          <ForumSelectionHeaderButtons
            setRefreshing={setRefreshing}
            categoryID={route.params.categoryID}
            items={forumListData}
            selectedItems={selectedItems}
          />
        </View>
      );
    }
    return (
      <View>
        <MaterialHeaderButtons>
          {category && <ForumCategoryScreenSearchMenu category={category} />}
          <ForumThreadScreenSortMenu category={category} />
          <ForumThreadScreenFilterMenu />
          <ForumCategoryScreenActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, [enableSelection, route.params.categoryID, category, forumListData, selectedItems, setRefreshing]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
    if (enableSelection) {
      navigation.setOptions({title: `Selected: ${selectedItems.length}`});
    } else {
      navigation.setOptions({title: 'Forums'});
    }
  }, [isFocused, getNavButtons, navigation, enableSelection, selectedItems.length]);

  if (isLoading || !data || !category) {
    return <LoadingView />;
  }

  if (category.paginator.total === 0 && forumListData.length === 0) {
    return (
      <AppView>
        <ListTitleView title={category.title} />
        <ForumEmptyListView onRefresh={onRefresh} refreshing={refreshing} />
        {!isUserRestricted && <ForumCategoryFAB category={category} />}
      </AppView>
    );
  }

  if (forumFilter) {
    return (
      <AppView>
        <ForumThreadsRelationsView
          relationType={ForumFilter.toRelation(forumFilter)}
          category={category}
          title={category.title}
        />
        {!isUserRestricted && <ForumCategoryFAB category={category} />}
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
        category={category}
        isFetchingPreviousPage={isFetchingPreviousPage}
        isFetchingNextPage={isFetchingNextPage}
        refreshing={refreshing}
        onRefresh={onRefresh}
        setRefreshing={setRefreshing}
        enableFAB={!isUserRestricted}
        title={category.title}
        subtitle={`${category.paginator.total} ${pluralize('forum', category.paginator.total)}`}
        scrollToTopIntent={route.params.scrollToTopIntent}
      />
    </AppView>
  );
};
