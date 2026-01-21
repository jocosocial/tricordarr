import {useMemo} from 'react';

import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';

interface UseFezOptions {
  fezID: string;
}

interface UseFezReturn {
  fezData: FezData | undefined;
  fezPages: FezData[];
  isLoading: boolean;
  isOwner: boolean;
  isMember: boolean;
  isParticipant: boolean;
  isWaitlist: boolean;
  refetch: () => void;
}

/**
 * Hook that provides computed properties for a fez.
 * Fetches fez data and computes owner/member status.
 *
 * This was spawned during SeamailEdit so it hasn't seen much use yet.
 */
export const useFez = ({fezID}: UseFezOptions): UseFezReturn => {
  const queryResult = useFezQuery({fezID});
  const {data: profilePublicData} = useUserProfileQuery();
  const {data, isLoading, refetch} = queryResult;

  const fezData = useMemo(() => {
    return data?.pages[0];
  }, [data]);

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
    isLoading,
    isOwner,
    isMember,
    isParticipant,
    isWaitlist,
    refetch: () => {
      refetch();
    },
  };
};
