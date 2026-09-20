import {InfiniteData, QueryClient, useQueryClient} from '@tanstack/react-query';
import pluralize from 'pluralize';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {useUserNotificationData} from '#src/Context/Contexts/UserNotificationDataContext';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {findInPages, PageItemAccessor} from '#src/Libraries/CacheReduction';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {TokenAuthPaginationQueryOptionsTypeV2} from '#src/Queries/TokenAuthQuery';
import {FezData, FezListData} from '#src/Structs/ControllerStructs';

const fezListKeyPrefixes = ['/fez/joined', '/fez/owner', '/fez/open', '/fez/former'];
const fezListAccessor: PageItemAccessor<FezListData, FezData> = {
  get: page => page.fezzes,
  set: (page, items) => ({...page, fezzes: items}),
};

function getListCacheReadCount(queryClient: QueryClient, fezID: string): number | undefined {
  const matchesFez = (f: FezData) => f.fezID === fezID;
  for (const keyPrefix of fezListKeyPrefixes) {
    const entries = queryClient.getQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]});
    for (const [, data] of entries) {
      if (data) {
        const fez = findInPages(data, fezListAccessor, matchesFez);
        if (fez?.members !== undefined) {
          return fez.members.readCount;
        }
      }
    }
  }
  return undefined;
}

interface UseFezDataOptions {
  fezID: string;
  initialReadCountHint?: number;
  queryOptions?: TokenAuthPaginationQueryOptionsTypeV2<FezData>;
}

interface UseFezDataReturn {
  fezData: FezData | undefined;
  fezPages: FezData[];
  postDayCount: number;
  initialReadCount: number | undefined;
  fetchNextPage: () => Promise<unknown>;
  fetchPreviousPage: () => Promise<unknown>;
  hasNextPage: boolean | undefined;
  hasPreviousPage: boolean | undefined;
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isOwner: boolean;
  isMember: boolean;
  isParticipant: boolean;
  isWaitlist: boolean;
  isChatEditable: boolean;
  isMuted: boolean;
  isFull: boolean;
  participantLabel: string | undefined;
  getParticipantLabel: (fez: FezData) => string;
  refetch: () => Promise<unknown>;
  resetInitialReadCount: () => void;
}

/**
 * Returns a string describing the number of participants in a fez.
 * This is not in the hook because it gets called in at least one place that may not have
 * a Fez (ScheduleItemScreenBase.tsx). And we know how we feel about conditional hooks.
 */
export const getParticipantLabel = (fez: FezData): string => {
  let minimumSuffix = '';
  if (fez.minParticipants !== 0) {
    minimumSuffix = `, ${fez.minParticipants} minimum`;
  }
  if (fez.maxParticipants === 0) {
    return `${fez.participantCount} ${pluralize('attendee', fez.participantCount)}${minimumSuffix}`;
  }
  const waitlistCount: number = fez.members?.waitingList.length || 0;
  let attendeeCountString = `${fez.participantCount}/${fez.maxParticipants} ${pluralize(
    'participant',
    fez.maxParticipants,
  )}`;
  if (fez.participantCount >= fez.maxParticipants) {
    attendeeCountString = 'Full';
  }
  return `${attendeeCountString}, ${waitlistCount} waitlisted${minimumSuffix}`;
};

/**
 * Hook that provides computed properties for a fez.
 * Fetches fez data and computes owner/member status.
 * Captures the initial readCount from list caches first (unaffected by detail GET
 * mark-as-read), then from detail data, so callers can pass it forward (e.g. to a
 * chat screen) and show the correct unread badge.
 */
export const useFezData = ({fezID, initialReadCountHint, queryOptions}: UseFezDataOptions): UseFezDataReturn => {
  const queryClient = useQueryClient();
  const queryResult = useFezQuery({fezID, options: queryOptions});
  const {currentUserID} = useSession();
  const {getAdjustedMoment} = useTime();
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    refetch,
  } = queryResult;
  const initialReadCountRef = useRef<number | undefined>(undefined);
  const hasConsumedHintRef = useRef(false);
  const [, setReadCountVersion] = useState(0);

  const fezData = useMemo(() => {
    return data?.pages[0];
  }, [data]);

  // Capture readCount once using highest-priority sources:
  // route hint -> list caches -> detail data. Subsequent cache mutations
  // (markRead, socket-driven postCount bumps) will not overwrite this value
  // until resetInitialReadCount is called.
  if (initialReadCountRef.current === undefined) {
    if (initialReadCountHint !== undefined && !hasConsumedHintRef.current) {
      initialReadCountRef.current = initialReadCountHint;
      hasConsumedHintRef.current = true;
    } else if (initialReadCountHint !== undefined && hasConsumedHintRef.current) {
      if (fezData?.members) {
        const listReadCount = getListCacheReadCount(queryClient, fezID);
        initialReadCountRef.current = listReadCount ?? fezData.members.readCount;
      }
    } else if (fezData?.members) {
      const listReadCount = getListCacheReadCount(queryClient, fezID);
      initialReadCountRef.current = listReadCount ?? fezData.members.readCount;
    }
  }

  // Recomputes immediately (rather than clearing the ref and waiting for the next
  // render's render-body recompute) so the new value is read in the same tick as
  // the cache writes that motivated the reset (e.g. appendPost after sending a
  // message), instead of depending on React's re-render scheduling to observe them.
  const resetInitialReadCount = useCallback(() => {
    const detailReadCount = queryClient
      .getQueriesData<InfiniteData<FezData>>({queryKey: [`/fez/${fezID}`]})
      .map(([, entryData]) => entryData?.pages[entryData.pages.length - 1]?.members?.readCount)
      .find(value => value !== undefined);
    const listReadCount = getListCacheReadCount(queryClient, fezID);
    initialReadCountRef.current = listReadCount ?? detailReadCount;
    setReadCountVersion(v => v + 1);
  }, [queryClient, fezID]);

  /**
   * Get the query pages.
   */
  const fezPages = useMemo(() => {
    return data?.pages || [];
  }, [data]);

  /**
   * Number of distinct calendar days (in adjusted timezone) among all loaded posts.
   * Used by the chat list to decide whether to show day dividers (e.g. only when > 2).
   */
  const postDayCount = useMemo(() => {
    const posts = fezPages.flatMap(p => p.members?.posts ?? []);
    const dayKeys = new Set(posts.map(post => getAdjustedMoment(post.timestamp).format('YYYY-MM-DD')));
    return dayKeys.size;
  }, [fezPages, getAdjustedMoment]);

  /**
   * Check if you are the owner of the fez.
   */
  const isOwner = useMemo(() => {
    if (!fezData || !currentUserID) {
      return false;
    }
    return fezData.owner.userID === currentUserID;
  }, [fezData, currentUserID]);

  /**
   * Check if you are a Participant.
   */
  const isParticipant = useMemo(() => {
    if (!fezData?.members || !currentUserID) {
      return false;
    }
    return fezData?.members.participants.some(p => p.userID === currentUserID);
  }, [fezData, currentUserID]);

  /**
   * Check if you are on the Waitlist.
   */
  const isWaitlist = useMemo(() => {
    if (!fezData?.members || !currentUserID) {
      return false;
    }
    return fezData?.members.waitingList.some(p => p.userID === currentUserID);
  }, [fezData, currentUserID]);

  /**
   * Check if you are either a Participant or Waitlist member.
   */
  const isMember = useMemo(() => {
    return isWaitlist || isParticipant;
  }, [isWaitlist, isParticipant]);

  /**
   * For LFGs and PersonalEvents we do not show the Edit button in the chat screen.
   * But for Seamails the chat screen is the only place where the owner could edit.
   */
  const isChatEditable = useMemo(() => {
    if (!fezData) {
      return false;
    }
    return isOwner && FezType.isSeamailType(fezData.fezType);
  }, [isOwner, fezData]);

  /**
   * Check if this chat is muted.
   */
  const isMuted = useMemo(() => {
    if (!fezData?.members) {
      return false;
    }
    return fezData.members.isMuted;
  }, [fezData]);

  const isFull = useMemo(() => {
    if (!fezData || fezData.maxParticipants === 0 || !fezData.members) {
      return false;
    }
    return fezData.members.participants.length >= fezData.maxParticipants;
  }, [fezData]);

  const participantLabel = useMemo(() => (fezData ? getParticipantLabel(fezData) : undefined), [fezData]);

  return {
    fezData,
    fezPages,
    postDayCount,
    initialReadCount: initialReadCountRef.current,
    fetchNextPage: () => fetchNextPage(),
    fetchPreviousPage: () => fetchPreviousPage(),
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isFetching,
    isLoading,
    isOwner,
    isMember,
    isParticipant,
    isWaitlist,
    isMuted,
    isChatEditable,
    isFull,
    participantLabel,
    getParticipantLabel,
    refetch: () => refetch(),
    resetInitialReadCount,
  };
};

/**
 * Marks a fez read as soon as it has anything left to clear: unread posts (per readCount vs.
 * postCount, or the initialReadCount captured before the detail GET's own mark-as-read), or the
 * "Added To" state from UserNotificationData. A chat/event the user was added to but that has no
 * posts yet has readCount === postCount (often both 0), so the unread check alone can't clear the
 * "Added To" badge -- addedTo has to be checked separately.
 *
 * Call this from a screen that represents "the user viewed this fez" (chat screens, the personal
 * event detail screen). Screens that only reference a fez in passing (edit forms, action menus,
 * participant lists) should not call this.
 */
export const useMarkFezReadEffect = (fez: FezData | undefined, initialReadCount: number | undefined): void => {
  const {markRead} = useFezCacheReducer();
  const {data: notificationData, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {isAddedTo} = useUserNotificationData();

  useEffect(() => {
    if (fez && fez.members) {
      const hasUnread =
        fez.members.readCount !== fez.members.postCount ||
        (initialReadCount !== undefined && initialReadCount < fez.members.postCount);
      const addedTo = isAddedTo(notificationData, fez);
      if (hasUnread || addedTo) {
        markRead(fez.fezID);
        // The UND drives the tab bar, seamail account buttons, and Schedule Day "Added To"
        // badge counts and we don't have a cache reducer for it yet.
        refetchUserNotificationData();
      }
    }
  }, [fez, initialReadCount, markRead, notificationData, refetchUserNotificationData, isAddedTo]);
};
