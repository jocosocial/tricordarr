import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useFirstDefined} from '#src/Hooks/useFirstDefined';
import {getForumThreadReadState} from '#src/Libraries/ChatList/InitialScroll';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumThreadQuery} from '#src/Queries/Forum/ForumThreadQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumThreadScreenBase} from '#src/Screens/Forum/Thread/ForumThreadScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadScreen>;

export const ForumThreadScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.forumThreadHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={`/forum/${props.route.params.forumID}`}>
        <ForumThreadScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

/**
 * Loads a forum thread and works out how far the user had read in it, from the forum list entry it
 * was opened from or, when there is none (a link, an event forum, a moderation screen), from the
 * thread fetch itself (`ForumData.readCount`, jocosocial/swiftarr#688).
 */
const ForumThreadScreenInner = ({route}: Props) => {
  const {
    data,
    refetch,
    isLoading,
    isFetching,
    isFetchedAfterMount,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useForumThreadQuery(route.params.forumID);
  const listReadState = route.params.forumListData;
  // Only a fetch made since this screen mounted counts: a thread restored from the persisted cache
  // carries the read count from an earlier visit. Frozen, because each later fetch moves the server's
  // read marker and would move the New divider with it.
  const fetchedReadState = useFirstDefined(
    !listReadState && isFetchedAfterMount ? getForumThreadReadState(data) : undefined,
  );
  // Without a list entry, hold the thread on its loading view while that fetch is in flight, so the
  // initial position is not computed (and frozen) from cached data first. React Query reports the
  // mount refetch as fetching from the first render. A failed fetch ends the wait, and a query that
  // cannot run (signed out, maintenance) never starts one, so cached data still shows then.
  const waitingForReadState = !listReadState && !isFetchedAfterMount && isFetching;

  return (
    <ForumThreadScreenBase
      data={data}
      refetch={refetch}
      isLoading={isLoading || waitingForReadState}
      fetchNextPage={fetchNextPage}
      fetchPreviousPage={fetchPreviousPage}
      isFetchingNextPage={isFetchingNextPage}
      isFetchingPreviousPage={isFetchingPreviousPage}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      readState={listReadState ?? fetchedReadState}
      titleOverride={route.params.titleOverride}
      initialElevation={route.params.asPrivilegedUser}
    />
  );
};
