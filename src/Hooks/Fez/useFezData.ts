import {useAppState} from '@react-native-community/hooks';
import {useIsFocused} from '@react-navigation/native';
import {InfiniteData, QueryClient, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import pluralize from 'pluralize';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {useUserNotificationData} from '#src/Context/Contexts/UserNotificationDataContext';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {findInPages, PageItemAccessor} from '#src/Libraries/CacheReduction';
import {cancelContentNotification} from '#src/Libraries/Notifications/Content';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {defaultFezQueryOptions, useFezQuery} from '#src/Queries/Fez/FezQueries';
import {TokenAuthPaginationQueryOptionsTypeV2} from '#src/Queries/TokenAuthQuery';
import {ErrorResponse, FezData, FezListData, MembersOnlyData} from '#src/Structs/ControllerStructs';

const fezListKeyPrefixes = ['/fez/joined', '/fez/owner', '/fez/open', '/fez/former'];
const fezListAccessor: PageItemAccessor<FezListData, FezData> = {
  get: page => page.fezzes,
  set: (page, items) => ({...page, fezzes: items}),
};

/**
 * The chat's members data from the first fez list cache (Seamail, LFG, private event lists) that holds
 * it, or undefined when no list has loaded it.
 *
 * @param queryClient The query client.
 * @param fezID The chat.
 */
function getListCacheMembers(queryClient: QueryClient, fezID: string): MembersOnlyData | undefined {
  const matchesFez = (f: FezData) => f.fezID === fezID;
  for (const keyPrefix of fezListKeyPrefixes) {
    const entries = queryClient.getQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]});
    for (const [, data] of entries) {
      if (data) {
        const fez = findInPages(data, fezListAccessor, matchesFez);
        if (fez?.members !== undefined) {
          return fez.members;
        }
      }
    }
  }
  return undefined;
}

/**
 * The chat's read count from the fez list caches, or undefined when no list has loaded it.
 *
 * @param queryClient The query client.
 * @param fezID The chat.
 */
function getListCacheReadCount(queryClient: QueryClient, fezID: string): number | undefined {
  return getListCacheMembers(queryClient, fezID)?.readCount;
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
  /**
   * The cached chat is behind a fez list (the list counts more posts than the cache holds) and the
   * fetch started on this mount has not finished. The chat screen holds its loading view meanwhile,
   * so the opening position is not worked out, and frozen, from the out-of-date copy.
   */
  isAwaitingFreshData: boolean;
  error: AxiosError<ErrorResponse> | null;
  isOwner: boolean;
  isMember: boolean;
  isParticipant: boolean;
  isWaitlist: boolean;
  isChatEditable: boolean;
  isMuted: boolean;
  isFavorite: boolean;
  isFull: boolean;
  participantLabel: string | undefined;
  getParticipantLabel: (fez: FezData, options?: ParticipantLabelOptions) => string;
  refetch: () => Promise<unknown>;
  resetInitialReadCount: () => void;
}

/**
 * Options for getParticipantLabel.
 */
export interface ParticipantLabelOptions {
  /** Drop the minimum suffix and the waitlisted count, leaving only the participant count (or "Full"). */
  compact?: boolean;
}

/**
 * Returns a string describing the number of participants in a fez.
 * This is not in the hook because it gets called in at least one place that may not have
 * a Fez (ScheduleItemScreenBase.tsx). And we know how we feel about conditional hooks.
 * With `compact`, the minimum and waitlisted details are omitted for space-constrained rows.
 */
export const getParticipantLabel = (fez: FezData, options: ParticipantLabelOptions = {}): string => {
  const {compact = false} = options;
  let minimumSuffix = '';
  if (!compact && fez.minParticipants !== 0) {
    minimumSuffix = `, ${fez.minParticipants} minimum`;
  }
  if (fez.maxParticipants === 0) {
    return `${fez.participantCount} ${pluralize('attendee', fez.participantCount)}${minimumSuffix}`;
  }
  let attendeeCountString = `${fez.participantCount}/${fez.maxParticipants} ${pluralize(
    'participant',
    fez.maxParticipants,
  )}`;
  if (fez.participantCount >= fez.maxParticipants) {
    attendeeCountString = 'Full';
  }
  if (compact) {
    return attendeeCountString;
  }
  const waitlistCount: number = fez.members?.waitingList.length || 0;
  return `${attendeeCountString}, ${waitlistCount} waitlisted${minimumSuffix}`;
};

/**
 * Hook that provides computed properties for a fez.
 * Fetches fez data and computes owner/member status.
 * Captures the initial readCount from list caches first (unaffected by detail GET
 * mark-as-read), then from detail data, so callers can pass it forward (e.g. to a
 * chat screen) and show the correct unread badge.
 * Exposes the fez query's error so a screen can tell why it has no fez data.
 *
 * The query only subscribes while the calling screen is focused. Swiftarr marks a fez read on
 * every detail GET, so a screen left mounted out of view (a chat under another tab or pushed
 * screen) must not refetch on app focus or invalidation; it fetches again when it is refocused.
 */
export const useFezData = ({fezID, initialReadCountHint, queryOptions}: UseFezDataOptions): UseFezDataReturn => {
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const queryResult = useFezQuery({
    fezID,
    options: {...(queryOptions ?? defaultFezQueryOptions), subscribed: isFocused},
  });
  const {currentUserID} = useSession();
  const {getAdjustedMoment} = useTime();
  const {
    data,
    error,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchedAfterMount,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    refetch,
  } = queryResult;
  // Seeded from the route hint at mount so the common case needs no extra render.
  const [initialReadCount, setInitialReadCount] = useState<number | undefined>(() => initialReadCountHint);
  const [hasConsumedHint, setHasConsumedHint] = useState(() => initialReadCountHint !== undefined);

  const fezData = useMemo(() => {
    return data?.pages[0];
  }, [data]);

  // Capture readCount once using highest-priority sources:
  // route hint -> list caches -> detail data. Subsequent cache mutations
  // (markRead, socket-driven postCount bumps) will not overwrite this value
  // until resetInitialReadCount is called. The hint is used at most once: after a reset clears the
  // value, it is recaptured from the caches. Captured as state during render (React's "adjust
  // state while rendering" pattern) so the value is available before this render commits.
  if (initialReadCount === undefined) {
    if (initialReadCountHint !== undefined && !hasConsumedHint) {
      setInitialReadCount(initialReadCountHint);
      setHasConsumedHint(true);
    } else if (fezData?.members) {
      setInitialReadCount(getListCacheReadCount(queryClient, fezID) ?? fezData.members.readCount);
    }
  }

  // Recomputes immediately (rather than clearing the value and waiting for the next
  // render's render-body recompute) so the new value is read in the same tick as
  // the cache writes that motivated the reset (e.g. appendPost after sending a
  // message), instead of depending on React's re-render scheduling to observe them.
  const resetInitialReadCount = useCallback(() => {
    const detailReadCount = queryClient
      .getQueriesData<InfiniteData<FezData>>({queryKey: [`/fez/${fezID}`]})
      .map(([, entryData]) => entryData?.pages[entryData.pages.length - 1]?.members?.readCount)
      .find(value => value !== undefined);
    const listReadCount = getListCacheReadCount(queryClient, fezID);
    setInitialReadCount(listReadCount ?? detailReadCount);
  }, [queryClient, fezID]);

  // Read during render because the list caches are not subscribed here; whether the cached copy is
  // behind can only change when the detail query re-renders this hook anyway. A failed fetch ends
  // the wait (isFetching goes false), and a query that cannot run never starts one, so the cached
  // copy still shows then.
  const listPostCount = getListCacheMembers(queryClient, fezID)?.postCount;
  const cachedPostCount = fezData?.members?.postCount;
  const isAwaitingFreshData =
    !isFetchedAfterMount &&
    isFetching &&
    listPostCount !== undefined &&
    cachedPostCount !== undefined &&
    listPostCount > cachedPostCount;

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

  /**
   * Check if this chat is favorited.
   */
  const isFavorite = useMemo(() => {
    if (!fezData?.members) {
      return false;
    }
    return fezData.members.isFavorite;
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
    initialReadCount,
    fetchNextPage: () => fetchNextPage(),
    fetchPreviousPage: () => fetchPreviousPage(),
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isFetching,
    isLoading,
    isAwaitingFreshData,
    error,
    isOwner,
    isMember,
    isParticipant,
    isWaitlist,
    isMuted,
    isFavorite,
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
 *
 * Only marks read while the app is in the foreground and the screen is focused. A chat screen left
 * open stays mounted with its socket live when the app is backgrounded (or another screen is pushed
 * over it), and marking read then would clear the push notification for each new post and mark it
 * read on the server unseen. Returning to the screen marks it read.
 */
export const useMarkFezReadEffect = (fez: FezData | undefined, initialReadCount: number | undefined): void => {
  const {markRead} = useFezCacheReducer();
  const {data: notificationData, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {isAddedTo} = useUserNotificationData();
  const {appConfig} = useConfig();
  const appState = useAppState();
  const isFocused = useIsFocused();
  const isViewing = appState === 'active' && isFocused;

  useEffect(() => {
    if (isViewing && fez && fez.members) {
      const hasUnread =
        fez.members.readCount !== fez.members.postCount ||
        (initialReadCount !== undefined && initialReadCount < fez.members.postCount);
      const addedTo = isAddedTo(notificationData, fez);
      if (hasUnread || addedTo) {
        markRead(fez.fezID);
        // The UND drives the tab bar, seamail account buttons, and Schedule Day "Added To"
        // badge counts and we don't have a cache reducer for it yet.
        void refetchUserNotificationData();
      }
    }
  }, [isViewing, fez, initialReadCount, markRead, notificationData, refetchUserNotificationData, isAddedTo]);

  // Viewing the fez dismisses its notifications whether or not anything was unread, like viewing a
  // forum thread does. Opening it from a notification fetches it first, and that GET already marks
  // it read on the server, so the effect above often finds nothing unread and would leave them up.
  const fezID = fez?.fezID;
  useEffect(() => {
    if (isViewing && fezID && appConfig.markReadCancelPush) {
      void cancelContentNotification(fezID);
    }
  }, [isViewing, fezID, fez?.members?.postCount, appConfig.markReadCancelPush]);
};
