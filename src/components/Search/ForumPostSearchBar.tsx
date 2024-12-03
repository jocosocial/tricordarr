import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, Keyboard, RefreshControl, View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useForumPostSearchQuery} from '../Queries/Forum/ForumPostSearchQueries.ts';
import {ForumPostFlatList} from '../Lists/Forums/ForumPostFlatList';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../libraries/Enums/Icons';
import {CategoryData, ForumData, ForumListData, PostData} from '../../libraries/Structs/ControllerStructs';
import {CommonStackComponents, useCommonStack} from '../Navigation/CommonScreens.tsx';

interface ForumPostSearchBarProps {
  category?: CategoryData;
  forum?: ForumListData | ForumData;
}

export const ForumPostSearchBar = (props: ForumPostSearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [queryEnable, setQueryEnable] = useState(false);
  const {setErrorMessage} = useErrorHandler();
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
    remove,
  } = useForumPostSearchQuery(
    {
      search: searchQuery,
      ...(props.category ? {category: props.category.categoryID} : undefined),
      ...(props.forum ? {forum: props.forum.forumID} : undefined),
    },
    {
      enabled: queryEnable,
    },
  );
  const {commonStyles} = useStyles();
  const [forumPosts, setForumPosts] = useState<PostData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const commonNavigation = useCommonStack();
  const flatListRef = useRef<FlatList<PostData>>(null);

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    setQueryEnable(false);
  };

  const onClear = () => {
    setForumPosts([]);
    remove();
    setQueryEnable(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  const onSearch = () => {
    if (!searchQuery || searchQuery.length < 3) {
      setErrorMessage('Search string must be >2 characters');
      setQueryEnable(false);
    } else {
      setQueryEnable(true);
      console.log('[ForumPostSearchBar.tsx] Refetching results');
      refetch();
      Keyboard.dismiss();
    }
  };

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage && queryEnable) {
      setRefreshing(true);
      fetchNextPage().finally(() => setRefreshing(false));
    }
  };
  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage && queryEnable) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => setRefreshing(false));
    }
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => {
              commonNavigation.push(CommonStackComponents.forumHelpScreen);
            }}
          />
        </HeaderButtons>
      </View>
    );
  }, [commonNavigation]);

  useEffect(() => {
    commonNavigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, commonNavigation]);

  useEffect(() => {
    if (data && data.pages && queryEnable) {
      setForumPosts(data.pages.flatMap(p => p.posts));
    }
  }, [data, setForumPosts, queryEnable]);

  return (
    <>
      <View style={[commonStyles.marginVerticalSmall, commonStyles.marginHorizontal]}>
        <Searchbar
          placeholder={'Search for forum posts'}
          onIconPress={onSearch}
          onChangeText={onChangeSearch}
          value={searchQuery}
          onSubmitEditing={onSearch}
          onClearIconPress={onClear}
          style={[commonStyles.marginVerticalSmall]}
        />
      </View>
      <View style={[commonStyles.flex]}>
        <ForumPostFlatList
          flatListRef={flatListRef}
          refreshControl={
            <RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} enabled={!!searchQuery} />
          }
          postList={forumPosts}
          handleLoadNext={handleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          itemSeparator={'time'}
          enableShowInThread={true}
          hasNextPage={hasNextPage}
        />
      </View>
    </>
  );
};
