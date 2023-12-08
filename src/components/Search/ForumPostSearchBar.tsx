import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useForumPostSearchQuery} from '../Queries/Forum/ForumPostSearchQueries';
import {ForumPostFlatList} from '../Lists/Forums/ForumPostFlatList';
import {useModal} from '../Context/Contexts/ModalContext';
import {HelpModalView} from '../Views/Modals/HelpModalView';
import {forumPostHelpText} from '../Screens/Forum/Post/ForumPostScreenBase';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useForumStackNavigation} from '../Navigation/Stacks/ForumStackNavigator';
import {useTwitarr} from '../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../Reducers/Forum/ForumPostListReducer';
import {PostData} from '../../libraries/Structs/ControllerStructs';
import {useIsFocused} from '@react-navigation/native';

export const ForumPostSearchBar = () => {
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
    },
    undefined,
    {
      enabled: queryEnable,
    },
  );
  const {commonStyles} = useStyles();
  const {forumPosts, dispatchForumPosts} = useTwitarr();
  const [refreshing, setRefreshing] = useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const navigation = useForumStackNavigation();
  const flatListRef = useRef<FlatList<PostData>>(null);
  const isFocused = useIsFocused();

  const handleHelpModal = useCallback(() => {
    setModalContent(<HelpModalView text={forumPostHelpText} />);
    setModalVisible(true);
  }, [setModalContent, setModalVisible]);

  const onChangeSearch = (query: string) => setSearchQuery(query);
  const onClear = () => {
    dispatchForumPosts({
      type: ForumPostListActions.clear,
    });
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
          <Item title={'Help'} iconName={AppIcons.help} onPress={handleHelpModal} />
        </HeaderButtons>
      </View>
    );
  }, [handleHelpModal]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && data.pages && isFocused) {
      dispatchForumPosts({
        type: ForumPostListActions.setList,
        postList: data.pages.flatMap(p => p.posts),
      });
    }
  }, [data, dispatchForumPosts, isFocused]);

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
          invertList={false}
          enableShowInThread={true}
          hasNextPage={hasNextPage}
        />
      </View>
    </>
  );
};
