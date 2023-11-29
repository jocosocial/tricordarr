import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {PostData} from '../../libraries/Structs/ControllerStructs';
import {useForumPostSearchQuery} from '../Queries/Forum/ForumSearchQueries';
import {ForumPostFlatList} from '../Lists/Forums/ForumPostFlatList';
import {useModal} from '../Context/Contexts/ModalContext';
import {HelpModalView} from '../Views/Modals/HelpModalView';
import {forumPostHelpText} from '../Screens/Forum/ForumPostScreenBase';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useForumStackNavigation} from '../Navigation/Stacks/ForumStackNavigator';

export const ForumPostSearchBar = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
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
  } = useForumPostSearchQuery(
    {
      search: searchQuery,
    },
    undefined,
    {
      enabled: false,
    },
  );
  const {commonStyles} = useStyles();
  const [postList, setPostList] = useState<PostData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const navigation = useForumStackNavigation();

  const handleHelpModal = useCallback(() => {
    setModalContent(<HelpModalView text={forumPostHelpText} />);
    setModalVisible(true);
  }, [setModalContent, setModalVisible]);

  const onChangeSearch = (query: string) => setSearchQuery(query);
  const onClear = () => setPostList([]);
  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  const onSearch = () => {
    if (!searchQuery || searchQuery.length < 3) {
      setErrorMessage('Search string must be >2 characters');
    } else {
      refetch();
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
          <Item title={'Help'} iconName={AppIcons.help} onPress={handleHelpModal} />
        </HeaderButtons>
      </View>
    );
  }, [handleHelpModal, onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && data.pages) {
      setPostList(data.pages.flatMap(p => p.posts));
    }
  }, [data]);

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
          refreshControl={
            <RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} enabled={!!searchQuery} />
          }
          postList={postList}
          handleLoadNext={handleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          itemSeparator={'time'}
          invertList={false}
          enableShowInThread={true}
        />
      </View>
    </>
  );
};
