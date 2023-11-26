import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useForumThreadQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {Button, Divider, Text} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {ForumCategoryFAB} from '../../Buttons/FloatingActionButtons/ForumCategoryFAB';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumActionsMenu} from '../../Menus/ForumActionsMenu';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {PostData} from '../../../libraries/Structs/ControllerStructs';
import {ForumPostFlatList} from '../../Lists/Forums/ForumPostFlatList';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumThreadScreen,
  NavigatorIDs.forumStack
>;

export const ForumThreadScreen = ({route, navigation}: Props) => {
  const {
    data,
    refetch,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useForumThreadQuery(route.params.forumID);
  // const {forumCategories, setForumCategories} = useTwitarr();
  const [refreshing, setRefreshing] = useState(false);
  const {profilePublicData} = useUserData();
  const [postList, setPostList] = useState<PostData[]>([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  // useEffect(() => {
  //   if (data) {
  //     setForumCategories(data);
  //   }
  // }, [data, setForumCategories]);

  // const getNavButtons = useCallback(() => {
  //   return (
  //     <View>
  //       <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
  //         <Item title={'Favorite'} iconName={AppIcons.favorite} onPress={() => console.log('fav')} />
  //         <Item title={'Mute'} iconName={AppIcons.mute} onPress={() => console.log('mute')} />
  //         {profilePublicData?.header.username === data?.creator.username && (
  //           <Item title={'Edit'} iconName={AppIcons.edituser} onPress={() => console.log('edit')} />
  //         )}
  //         <ForumActionsMenu forumData={data} />
  //       </HeaderButtons>
  //     </View>
  //   );
  // }, [data, profilePublicData?.header.username]);
  //
  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: getNavButtons,
  //   });
  // }, [getNavButtons, navigation]);

  console.log(data?.pages.length);

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

  useEffect(() => {
    if (data && data.pages) {
      setPostList(data.pages.flatMap(forumData => forumData.posts));
    }
  }, [data]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ForumPostFlatList postList={postList} onEndReached={handleLoadNext} />
      {/*<ScrollingContentView*/}
      {/*  isStack={true}*/}
      {/*  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh || isLoading} />}>*/}
      {/*  <View>*/}
      {/*    <ListSection>*/}
      {/*      <Button onPress={() => fetchNextPage()}>Fetch Next</Button>*/}
      {/*      <Button onPress={() => fetchPreviousPage()}>Fetch Previous</Button>*/}
      {/*      /!*{data.posts.map((post, index) => {*!/*/}
      {/*      /!*  return (*!/*/}
      {/*      /!*    <React.Fragment key={post.postID}>*!/*/}
      {/*      /!*      {index === 0 && <Divider bold={true} />}*!/*/}
      {/*      /!*      <Text>{post.text}</Text>*!/*/}
      {/*      /!*      <Divider bold={true} />*!/*/}
      {/*      /!*    </React.Fragment>*!/*/}
      {/*      /!*  );*!/*/}
      {/*      /!*})}*!/*/}
      {/*    </ListSection>*/}
      {/*  </View>*/}
      {/*</ScrollingContentView>*/}
    </AppView>
  );
};
