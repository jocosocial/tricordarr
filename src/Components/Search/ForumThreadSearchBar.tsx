import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {ForumThreadList} from '#src/Components/Lists/Forums/ForumThreadList';
import {ForumThreadScreenSortMenu} from '#src/Components/Menus/Forum/ForumThreadScreenSortMenu';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ForumSort} from '#src/Enums/ForumSortFilter';
import {AppIcons} from '#src/Enums/Icons';
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
  const [refreshing, setRefreshing] = useState(false);
  const commonNavigation = useCommonStack();

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    setEnable(false);
  };
  const onClear = () => {
    setEnable(false);
    setForumList([]);
  };
  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  const onSearch = () => {
    if (!searchQuery || searchQuery.length < 3) {
      setEnable(false);
    } else {
      setEnable(true);
      refetch();
      Keyboard.dismiss();
    }
  };

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
          <ForumThreadScreenSortMenu />
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
    if (data && data.pages) {
      setForumList(data.pages.flatMap(p => p.forumThreads));
    }
  }, [data]);

  return (
    <>
      <SearchBarBase searchQuery={searchQuery} onSearch={onSearch} onChangeSearch={onChangeSearch} onClear={onClear} />
      <View style={[commonStyles.flex]}>
        <ForumThreadList
          refreshControl={
            <RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} enabled={!!searchQuery} />
          }
          forumListData={forumList}
          handleLoadNext={handleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </View>
    </>
  );
};
