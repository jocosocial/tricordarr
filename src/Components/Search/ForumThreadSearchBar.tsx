import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ForumThreadList} from '#src/Components/Lists/Forums/ForumThreadList';
import {ForumThreadScreenSortMenu} from '#src/Components/Menus/Forum/ForumThreadScreenSortMenu';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ForumSort} from '#src/Enums/ForumSortFilter';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useSafePagination} from '#src/Hooks/useSafePagination';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useForumSearchQuery} from '#src/Queries/Forum/ForumThreadSearchQueries';
import {CategoryData, ForumListData} from '#src/Structs/ControllerStructs';

interface Props {
  category?: CategoryData;
}

export const ForumThreadSearchBar = (props: Props) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [enable, setEnable] = useState(false);
  const {forumSortOrder} = useFilter();
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
  } = useForumSearchQuery(
    {
      search: searchQuery,
      sort: forumSortOrder !== ForumSort.event ? forumSortOrder : undefined,
      category: props.category?.categoryID,
    },
    {
      enabled: enable,
    },
  );
  const {commonStyles} = useStyles();
  const [forumList, setForumList] = useState<ForumListData[]>([]);
  const commonNavigation = useCommonStack();
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
    isRefreshing: isFetching,
  });

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    setEnable(false);
  };
  const onClear = () => {
    setEnable(false);
    setForumList([]);
  };

  const onSearch = () => {
    setEnable(true);
    refetch();
    Keyboard.dismiss();
  };

  const {safeHandleLoadNext, effectiveHasNextPage} = useSafePagination({
    searchQuery,
    minLength: 3,
    hasNextPage: hasNextPage ?? false,
    itemsLength: forumList.length,
    fetchNextPage: () => {
      if (!isFetchingNextPage) {
        setRefreshing(true);
        fetchNextPage().finally(() => setRefreshing(false));
      }
    },
  });

  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => setRefreshing(false));
    }
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <ForumThreadScreenSortMenu />
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
    if (data && data.pages) {
      setForumList(data.pages.flatMap(p => p.forumThreads));
    }
  }, [data]);

  return (
    <>
      <SearchBarBase searchQuery={searchQuery} onSearch={onSearch} onChangeSearch={onChangeSearch} onClear={onClear} />
      <View style={[commonStyles.flex]}>
        <ForumThreadList
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={!!searchQuery} />}
          forumListData={forumList}
          handleLoadNext={safeHandleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          hasNextPage={effectiveHasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </View>
    </>
  );
};
