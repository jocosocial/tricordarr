import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, RefreshControl, View} from 'react-native';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {CategoryData, ForumListData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {useForumSearchQuery} from '#src/Components/Queries/Forum/ForumThreadSearchQueries.ts';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {ForumThreadFlatList} from '#src/Components/Lists/Forums/ForumThreadFlatList.tsx';
import {useFilter} from '#src/Components/Context/Contexts/FilterContext.ts';
import {ForumSort} from '#src/Libraries/Enums/ForumSortFilter.ts';
import {ForumThreadScreenSortMenu} from '#src/Components/Menus/Forum/ForumThreadScreenSortMenu.tsx';
import {CommonStackComponents, useCommonStack} from '#src/Components/Navigation/CommonScreens.tsx';
import {SearchBarBase} from './SearchBarBase.tsx';

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
    remove,
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
    remove();
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
      <SearchBarBase
        searchQuery={searchQuery}
        onSearch={onSearch}
        onChangeSearch={onChangeSearch}
        onClear={onClear}
        remove={remove}
      />
      <View style={[commonStyles.flex]}>
        <ForumThreadFlatList
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
