import React, {useEffect} from 'react';
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

  useEffect(() => {
    console.log('[ForumThreadScreen.tsx] useEffect');
    const loadAllPrevious = async () => {
      console.log('starting preload');
      while (hasPreviousPage) {
        console.log('Fetching previous page');
        await fetchPreviousPage();
      }
      // if (hasNextPage) {
      //   await fetchNextPage();
      // }
      console.log('finished preload');
      setLoadedPrevious(true);
    };
    loadAllPrevious();
  }, [fetchNextPage, fetchPreviousPage, hasNextPage, hasPreviousPage]);

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
