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
    console.log('[ForumThreadScreen.tsx] fetchAllPages start');
    if (hasNextPage) {
      console.log('[ForumThreadScreen.tsx] fetchAllPages hasNextPage');
      await fetchNextPage();
    }
    if (hasPreviousPage) {
      console.log('[ForumThreadScreen.tsx] fetchAllPages hasPreviousPage');
      await fetchPreviousPage();
    }
    if (!hasNextPage && !hasPreviousPage) {
      console.log('[ForumThreadScreen.tsx] fetchAllPages setLoaded ready');
      setLoadedPrevious(true);
    }
    console.log('[ForumThreadScreen.tsx] fetchAllPages end');
  }, [fetchNextPage, fetchPreviousPage, hasNextPage, hasPreviousPage]);

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
