import {InfiniteData, QueryClient, useQueryClient} from '@tanstack/react-query';
import {useCallback, useMemo, useRef, useState} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {findInPages, PageItemAccessor} from '#src/Libraries/CacheReduction';
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

interface UseFezOptions {
  fezID: string;
  queryOptions?: TokenAuthPaginationQueryOptionsTypeV2<FezData>;
}

interface UseFezReturn {
  fezData: FezData | undefined;
  fezPages: FezData[];
  initialReadCount: number | undefined;
  isFetching: boolean;
  isLoading: boolean;
  isOwner: boolean;
  isMember: boolean;
  isParticipant: boolean;
  isWaitlist: boolean;
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
export const useFez = ({fezID, queryOptions}: UseFezOptions): UseFezReturn => {
  const queryClient = useQueryClient();
  const queryResult = useFezQuery({fezID, options: queryOptions});
  const {currentUserID} = useSession();
  const {data, isFetching, isLoading, refetch} = queryResult;
  const initialReadCountRef = useRef<number | undefined>(undefined);
  const [, setReadCountVersion] = useState(0);

  const fezData = useMemo(() => {
    return data?.pages[0];
  }, [data]);

  // Capture readCount from list caches first (correct unread state), then fall back
  // to detail data. Subsequent cache mutations (markRead, socket-driven postCount bumps)
  // will not overwrite this value until resetInitialReadCount is called.
  if (fezData?.members && initialReadCountRef.current === undefined) {
    const listReadCount = getListCacheReadCount(queryClient, fezID);
    initialReadCountRef.current = listReadCount ?? fezData.members.readCount;
  }

  const resetInitialReadCount = useCallback(() => {
    initialReadCountRef.current = undefined;
    setReadCountVersion(v => v + 1);
  }, []);

  const fezPages = useMemo(() => {
    return data?.pages || [];
  }, [data]);

  const isOwner = useMemo(() => {
    if (!fezData || !currentUserID) {
      return false;
    }
    return fezData.owner.userID === currentUserID;
  }, [fezData, currentUserID]);

  const isMember = useMemo(() => {
    return fezData?.members !== undefined;
  }, [fezData]);

  const isParticipant = useMemo(() => {
    if (!fezData || !currentUserID) {
      return false;
    }
    return FezData.isParticipant(fezData, currentUserID);
  }, [fezData, currentUserID]);

  const isWaitlist = useMemo(() => {
    if (!fezData || !currentUserID) {
      return false;
    }
    return FezData.isWaitlist(fezData, currentUserID);
  }, [fezData, currentUserID]);

  return {
    fezData,
    fezPages,
    initialReadCount: initialReadCountRef.current,
    isFetching,
    isLoading,
    isOwner,
    isMember,
    isParticipant,
    isWaitlist,
    refetch: () => refetch(),
    resetInitialReadCount,
  };
};
