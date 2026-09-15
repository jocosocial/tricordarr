import {useMemo} from 'react';

import {huntPuzzleIsSolved} from '#src/Libraries/Hunts';
import {HuntOpenQueryOptions, useHuntPuzzleQuery} from '#src/Queries/Hunts/HuntQueries';
import {HuntPuzzleDetailData} from '#src/Structs/ControllerStructs';

interface UseHuntPuzzleDataOptions {
  puzzleID: string;
  options?: HuntOpenQueryOptions<HuntPuzzleDetailData>;
}

/**
 * Puzzle detail plus derived solver state. Named after `HuntPuzzleDetailData`.
 */
export const useHuntPuzzleData = ({puzzleID, options}: UseHuntPuzzleDataOptions) => {
  const query = useHuntPuzzleQuery({puzzleID, options});
  const isSolved = query.data ? huntPuzzleIsSolved(query.data) : false;
  const callInsNewestFirst = useMemo(() => {
    if (!query.data) {
      return [];
    }
    return [...query.data.callIns].reverse();
  }, [query.data]);

  return {
    ...query,
    puzzle: query.data,
    isSolved,
    callInsNewestFirst,
  };
};
