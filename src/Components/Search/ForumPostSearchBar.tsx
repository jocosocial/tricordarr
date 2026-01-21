import {FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ForumPostList} from '#src/Components/Lists/Forums/ForumPostList';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useSafePagination} from '#src/Hooks/useSafePagination';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useForumPostSearchQuery} from '#src/Queries/Forum/ForumPostSearchQueries';
import {CategoryData, ForumData, ForumListData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostSearchBarProps {
  category?: CategoryData;
  forum?: ForumListData | ForumData;
}

export const ForumPostSearchBar = (props: ForumPostSearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [queryEnable, setQueryEnable] = useState(false);
  const {data, refetch, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching} = useForumPostSearchQuery(
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
  const commonNavigation = useCommonStack();
  const flatListRef = useRef<FlashListRef<PostData>>(null);
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
    isRefreshing: isFetching,
  });

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    setQueryEnable(false);
  };

  const onClear = () => {
    setForumPosts([]);
    setQueryEnable(false);
  };

  const onSearch = () => {
    setQueryEnable(true);
    refetch();
    Keyboard.dismiss();
  };

  const {safeHandleLoadNext, effectiveHasNextPage} = useSafePagination({
    searchQuery,
    minLength: 3,
    hasNextPage: hasNextPage ?? false,
    itemsLength: forumPosts.length,
    fetchNextPage: () => {
      if (!isFetchingNextPage && queryEnable) {
        setRefreshing(true);
        fetchNextPage().finally(() => setRefreshing(false));
      }
    },
  });

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => {
              commonNavigation.push(CommonStackComponents.forumHelpScreen);
            }}
          />
        </MaterialHeaderButtons>
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
      <SearchBarBase searchQuery={searchQuery} onSearch={onSearch} onChangeSearch={onChangeSearch} onClear={onClear} />
      <View style={[commonStyles.flex]}>
        <ForumPostList
          listRef={flatListRef}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={!!searchQuery} />}
          postList={forumPosts}
          handleLoadNext={safeHandleLoadNext}
          itemSeparator={'time'}
          enableShowInThread={true}
          hasNextPage={effectiveHasNextPage}
        />
      </View>
    </>
  );
};
