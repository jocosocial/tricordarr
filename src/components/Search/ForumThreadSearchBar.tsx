import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, RefreshControl, View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ForumListData} from '../../libraries/Structs/ControllerStructs';
import {useForumSearchQuery} from '../Queries/Forum/ForumThreadSearchQueries';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useForumStackNavigation} from '../Navigation/Stacks/ForumStackNavigator';
import {ForumThreadFlatList} from '../Lists/Forums/ForumThreadFlatList';
import {useFilter} from '../Context/Contexts/FilterContext';
import {ForumSortOrder} from '../../libraries/Enums/ForumSortFilter';
import {ForumThreadScreenSortMenu} from '../Menus/Forum/ForumThreadScreenSortMenu';
import {ForumStackComponents} from '../../libraries/Enums/Navigation.ts';

interface Props {
  categoryID?: string;
}

export const ForumThreadSearchBar = (props: Props) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const {setErrorMessage} = useErrorHandler();
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
      sort: forumSortOrder !== ForumSortOrder.event ? forumSortOrder : undefined,
      category: props.categoryID,
    },
    {
      enabled: enable,
    },
  );
  const {commonStyles} = useStyles();
  const [forumList, setForumList] = useState<ForumListData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const forumNavigation = useForumStackNavigation();

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
      setErrorMessage('Search string must be >2 characters');
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
              forumNavigation.push(ForumStackComponents.forumHelpScreen);
            }}
          />
        </HeaderButtons>
      </View>
    );
  }, [forumNavigation]);

  useEffect(() => {
    forumNavigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, forumNavigation]);

  useEffect(() => {
    if (data && data.pages) {
      setForumList(data.pages.flatMap(p => p.forumThreads));
    }
  }, [data]);

  return (
    <>
      <View style={[commonStyles.marginVerticalSmall, commonStyles.marginHorizontal]}>
        <Searchbar
          placeholder={'Search for forums'}
          onIconPress={onSearch}
          onChangeText={onChangeSearch}
          value={searchQuery}
          onSubmitEditing={onSearch}
          onClearIconPress={onClear}
          style={[commonStyles.marginVerticalSmall]}
        />
      </View>
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
