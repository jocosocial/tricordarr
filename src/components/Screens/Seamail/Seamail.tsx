import {AppView} from '../../Views/AppView';
import {FlatList, RefreshControl, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {InfiniteData, useInfiniteQuery, useMutation, UseMutationResult, useQuery} from '@tanstack/react-query';
import {ErrorResponse, FezData, FezPostData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {FezPostListItem} from '../../Lists/Items/FezPostListItem';
import {SpaceDivider} from '../../Lists/Dividers/SpaceDivider';
import {NavBarIconButton} from '../../Buttons/IconButtons/NavBarIconButton';
import {SeamailActionsMenu} from '../../Menus/SeamailActionsMenu';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {FezPostForm} from '../../Forms/FezPostForm';
import {FormikHelpers} from 'formik';
import axios, {AxiosError, AxiosResponse, post} from 'axios';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {IconButton, Text} from 'react-native-paper';
import {SaveButton} from '../../Buttons/SaveButton';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {LabelDivider} from '../../Lists/Dividers/LabelDivider';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailScreen,
  NavigatorIDs.seamailStack
>;

interface FezPostMutationProps {
  fezID: string;
  postContentData: PostContentData;
}

const fezPostHandler = async ({fezID, postContentData}: FezPostMutationProps): Promise<AxiosResponse<FezPostData>> => {
  return await axios.post(`/fez/${fezID}/post`, postContentData);
};

// @TODO make this a setting or something.
const PAGE_SIZE = 10;

export const SeamailScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const [startIndex, setStartIndex] = useState<number | undefined>(undefined);
  const {isLoggedIn, isLoading} = useUserData();
  const {commonStyles} = useStyles();
  const {setErrorMessage} = useErrorHandler();
  const flatListRef = useRef<FlatList>(null);
  const [showButton, setShowButton] = useState(false);

  const {
    data,
    refetch,
    // fetchNextPage,
    fetchPreviousPage,
    // hasNextPage,
    hasPreviousPage,
    // isFetchingNextPage,
    isFetchingPreviousPage,
    // isError,
  } = useInfiniteQuery<FezData, Error>(
    [`/fez/${route.params.fezID}?limit=${PAGE_SIZE}&start=${startIndex}`],
    async ({pageParam = {start: undefined, limit: PAGE_SIZE}}) => {
      const {data: responseData} = await axios.get<FezData>(
        `/fez/${route.params.fezID}?limit=${pageParam.limit}&start=${pageParam.start}`,
      );
      return responseData;
    },
    {
      enabled: isLoggedIn && !isLoading && !!route.params.fezID,
      getNextPageParam: lastPage => {
        if (lastPage.members) {
          const {limit, start, total} = lastPage.members.paginator;
          const nextStart = start + limit;
          return nextStart < total ? {start: nextStart, limit} : undefined;
        }
        throw new Error('getNextPageParam no member');
      },
      getPreviousPageParam: firstPage => {
        if (firstPage.members) {
          const {limit, start} = firstPage.members.paginator;
          const prevStart = start - limit;
          return prevStart >= 0 ? {start: prevStart, limit} : undefined;
        }
        throw new Error('getPreviousPageParam no member');
      },
    },
  );

  function getPostCount(fezData: InfiniteData<FezData>) {
    let postCount = 0;
    fezData?.pages.flatMap(p => {
      if (p.members) {
        postCount += p.members.paginator.limit;
        console.log('by the way, readCount is', p.members.readCount);
        console.log('total is', p.members.postCount);
      }
    });
    return postCount;
  }

  const startIdx = data?.pages[0].members?.paginator.start;
  const endIdx = data?.pages[0].members?.paginator.start + getPostCount(data);
  console.log(`currently showing ${startIdx} through ${endIdx}`);

  //
  // const handleLoadMore = () => {
  //   if (!isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // };

  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => {
        setRefreshing(false);
      });
    }
  };

  const showPostAuthor = !!(data && data.pages[0].participantCount > 2);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const getNavButtons = useCallback(() => {
    return (
      <View style={[commonStyles.flexRow]}>
        <NavBarIconButton icon={'reload'} onPress={onRefresh} />
        {data && <SeamailActionsMenu fez={data.pages[0]} />}
      </View>
    );
  }, [commonStyles.flexRow, data, onRefresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const fezPostMutation: UseMutationResult<
    AxiosResponse<FezPostData>,
    AxiosError<ErrorResponse>,
    FezPostMutationProps
  > = useMutation(fezPostHandler, {
    retry: 0,
  });

  // const onSubmit = () => console.log('disabled for now');
  const onSubmit = useCallback(
    (values: PostContentData, formikHelpers: FormikHelpers<PostContentData>) => {
      fezPostMutation.mutate(
        {fezID: route.params.fezID, postContentData: values},
        {
          onSuccess: response => {
            formikHelpers.setSubmitting(false);
            formikHelpers.resetForm();
            // As the paginator moves, the array ordering is also changed.
            // Slice returns a copy, and there's no Array.last property :(
            data?.pages[data?.pages.length - 1].members?.posts?.push(response.data);
          },
          onError: error => {
            setErrorMessage(error.response?.data.reason);
          },
        },
      );
    },
    [data?.pages, fezPostMutation, route.params.fezID, setErrorMessage],
  );

  if (!data || isLoading) {
    return <LoadingView />;
  }

  const renderHeader = () => {
    return (
      <PaddedContentView padTop={true} invertVertical={true}>
        {!hasPreviousPage && (
          <Text variant={'labelMedium'}>You've reached the beginning of this Seamail conversation.</Text>
        )}
      </PaddedContentView>
    );
  };

  // Because of the inversion / up-is-down nonsense, we use scrollToOffset
  // rather than scrollToEnd.
  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  const handleScroll = (event: any) => {
    // I picked 450 out of a hat. Roughly 8 messages @ 56 units per message.
    setShowButton(event.nativeEvent.contentOffset.y > 450);
  };

  // console.log('should show?');
  // const shouldShowButton = scrollOffset > 450;

  // console.log(data.members?.paginator);
  // This is a big sketch. See below for more reasons why this is a thing.
  // https://www.reddit.com/r/reactjs/comments/rgyy68/can_somebody_help_me_understand_why_does_reverse/?rdt=33460
  const fezPostData: FezPostData[] = [...data.pages.flatMap(page => page.members?.posts || [])].reverse();
  return (
    <AppView>
      <FlatList
        ref={flatListRef}
        // I am not sure about the performance here. onScroll is great but fires A LOT.
        // onScrollBeginDrag={handleScroll}
        // onScrollEndDrag={handleScroll}
        onScroll={handleScroll}
        // This is dumb. Have to take the performance hit to allow selecting text.
        // https://github.com/facebook/react-native/issues/26264
        removeClippedSubviews={false}
        ItemSeparatorComponent={SpaceDivider}
        data={fezPostData}
        // Inverted murders performance to the point of locking the app.
        // So we do a series of verticallyInverted, relying on a deprecated style prop.
        // https://github.com/facebook/react-native/issues/30034
        // inverted={true}
        style={commonStyles.verticallyInverted}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={false} />}
        keyExtractor={(item: FezPostData) => String(item.postID)}
        // This is the Footer because of all the inversion crap. In our case,
        // footer renders at the top.
        ListFooterComponent={renderHeader}
        renderItem={({item, index, separators}) => (
          <PaddedContentView invertVertical={true} padBottom={false}>
            <FezPostListItem item={item} index={index} separators={separators} showAuthor={showPostAuthor} />
          </PaddedContentView>
        )}
        // End is Start, Start is End.
        onEndReached={handleLoadPrevious}
      />
      {showButton && <FloatingScrollButton onPress={scrollToBottom} />}
      <FezPostForm onSubmit={onSubmit} />
    </AppView>
  );
};
