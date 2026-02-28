import {InfiniteData, QueryClient, useQueryClient} from '@tanstack/react-query';
import pluralize from 'pluralize';
import {useCallback, useMemo, useRef, useState} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {FezType} from '#src/Enums/FezType';
import {findInPages, PageItemAccessor} from '#src/Libraries/CacheReduction';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {TokenAuthPaginationQueryOptionsTypeV2} from '#src/Queries/TokenAuthQuery';
import {FezData, FezListData} from '#src/Structs/ControllerStructs';

/**
 * Get a label for the number of attendees of this Fez. If maxParticipants is 0
 * that means unlimited and we don't need to tell users how many are remaining.
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

export const isFezFull = (fez: FezData): boolean => {
  if (fez.maxParticipants === 0 || !fez.members) {
    return false;
  }
  return fez.members.participants.length >= fez.maxParticipants;
};

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
  refetch: () => Promise<unknown>;
  resetInitialReadCount: () => void;
}

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

  const resetInitialReadCount = useCallback(() => {
    initialReadCountRef.current = undefined;
    setReadCountVersion(v => v + 1);
  }, []);

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

  const isFull = useMemo(() => (fezData ? isFezFull(fezData) : false), [fezData]);

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
    refetch: () => refetch(),
    resetInitialReadCount,
  };
};
