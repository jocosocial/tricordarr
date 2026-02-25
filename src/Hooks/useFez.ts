import {useCallback, useMemo, useRef} from 'react';

import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';

interface UseFezOptions {
  fezID: string;
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
 * Captures the initial readCount from the first successful data load
 * so callers can pass it forward (e.g. to a chat screen) before
 * markRead updates the cache.
 */
export const useFez = ({fezID}: UseFezOptions): UseFezReturn => {
  const queryResult = useFezQuery({fezID});
  const {data: profilePublicData} = useUserProfileQuery();
  const {data, isFetching, isLoading, refetch} = queryResult;
  const initialReadCountRef = useRef<number | undefined>(undefined);

  const fezData = useMemo(() => {
    return data?.pages[0];
  }, [data]);

  // Capture readCount on the first render where member data is available.
  // Subsequent cache mutations (markRead, socket-driven postCount bumps)
  // will not overwrite this value.
  if (fezData?.members && initialReadCountRef.current === undefined) {
    initialReadCountRef.current = fezData.members.readCount;
  }

  const resetInitialReadCount = useCallback(() => {
    initialReadCountRef.current = undefined;
  }, []);

  const fezPages = useMemo(() => {
    return data?.pages || [];
  }, [data]);

  const isOwner = useMemo(() => {
    if (!fezData || !profilePublicData) {
      return false;
    }
    return fezData.owner.userID === profilePublicData.header.userID;
  }, [fezData, profilePublicData]);

  const isMember = useMemo(() => {
    return fezData?.members !== undefined;
  }, [fezData]);

  const isParticipant = useMemo(() => {
    if (!fezData || !profilePublicData) {
      return false;
    }
    return FezData.isParticipant(fezData, profilePublicData.header);
  }, [fezData, profilePublicData]);

  const isWaitlist = useMemo(() => {
    if (!fezData || !profilePublicData) {
      return false;
    }
    return FezData.isWaitlist(fezData, profilePublicData.header);
  }, [fezData, profilePublicData]);

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
