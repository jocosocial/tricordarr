import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';
import {ForumThreadScreenBase} from './ForumThreadScreenBase';
import {useForumThreadQuery} from '../../../Queries/Forum/ForumThreadQueries';
import {LoadingView} from '../../../Views/Static/LoadingView.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadScreen>;
export const ForumThreadScreen = ({route}: Props) => {
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
  const [loadedPrevious, setLoadedPrevious] = React.useState(false);

  // const loadAllPrevious = useCallback(async () => {
  //   console.log('starting preload');
  //   while (hasPreviousPage) {
  //     console.log('Fetching previous page');
  //     await fetchPreviousPage();
  //     console.log(hasPreviousPage, new Date());
  //   }
  //   // while (hasNextPage) {
  //   //   console.log('Fetching next page');
  //   //   await fetchNextPage();
  //   // }
  //   console.log('finished preload');
  //   setLoadedPrevious(true);
  // }, [fetchPreviousPage, hasPreviousPage]);
  const fetchAllPages = useCallback(async () => {
    if (loadedPrevious) {
      return;
    }

    // Flag to prevent recursive fetching
    setLoadedPrevious(false);

    try {
      // Fetch all previous pages
      // while (true) {
      //   console.log('fetch previous');
      //   const canFetchPrevious = hasPreviousPage && !isFetchingPreviousPage;
      //   if (!canFetchPrevious) {
      //     break;
      //   }
      //   await fetchPreviousPage();
      // }

      // Fetch all next pages
      // while (true) {
      //   console.log('fetch next');
      //   const canFetchNext = hasNextPage && !isFetchingNextPage;
      //   if (!canFetchNext) {
      //     break;
      //   }
      //   await fetchNextPage();
      // }

      setLoadedPrevious(true); // Mark as done fetching
    } catch (error) {
      console.error('Error fetching pages:', error);
      setLoadedPrevious(false); // Reset to allow retries if needed
    }
  }, [
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    loadedPrevious,
  ]);

  useEffect(() => {
    console.log('[ForumThreadScreen.tsx] useEffect');
    fetchAllPages();
  }, [fetchAllPages]);

  if (!loadedPrevious) {
    return <LoadingView />;
  }

  return (
    <ForumThreadScreenBase
      data={data}
      refetch={refetch}
      isLoading={isLoading}
      fetchNextPage={fetchNextPage}
      fetchPreviousPage={fetchPreviousPage}
      isFetchingNextPage={isFetchingNextPage}
      isFetchingPreviousPage={isFetchingPreviousPage}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      invertList={true}
      forumListData={route.params.forumListData}
    />
  );
};
