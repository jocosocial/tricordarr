import React, {useCallback, useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {RefreshControl, View} from 'react-native';
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
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {Text} from 'react-native-paper';
import {ForumCategoryFAB} from '../../Buttons/FloatingActionButtons/ForumCategoryFAB.tsx';
import {SelectionButtons} from '../../Buttons/SegmentedButtons/SelectionButtons.tsx';
import {ListTitleView} from '../../Views/ListTitleView.tsx';
import {ForumThreadFlatList} from '../../Lists/Forums/ForumThreadFlatList.tsx';

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
  const [selectedItems, setSelectedItems] = useState<ForumListData[]>([]);
  const [enableSelection, setEnableSelection] = useState<boolean>(false);

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
            <Item iconName={AppIcons.mute} title={'Favorite'} />
            <Item iconName={AppIcons.check} title={'Favorite'} />
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
      <>
        <View>
          <ScrollingContentView
            isStack={true}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <PaddedContentView padTop={true}>
              <Text>There aren't any forums in this category yet.</Text>
            </PaddedContentView>
          </ScrollingContentView>
        </View>
        {!isUserRestricted && <ForumCategoryFAB categoryId={route.params.categoryID} />}
      </>
    );
  }

  const keyExtractor = (item: ForumListData) => item.forumID;

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
      <>
        {enableSelection ? (
          <SelectionButtons<ForumListData>
            keyExtractor={keyExtractor}
            items={forumListData}
            setEnableSelection={setEnableSelection}
            setSelectedItems={setSelectedItems}
            selectedItems={selectedItems}
          />
        ) : (
          <ListTitleView title={data?.pages[0].title} />
        )}

        <ForumThreadFlatList
          forumListData={forumListData}
          handleLoadNext={handleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          categoryID={route.params.categoryID}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          enableSelection={enableSelection}
          setEnableSelection={setEnableSelection}
          keyExtractor={keyExtractor}
        />
        {!isUserRestricted && <ForumCategoryFAB categoryId={route.params.categoryID} />}
      </>
    </AppView>
  );
};
