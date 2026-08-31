import {useOpenQuery} from '#src/Queries/OpenQuery';
import {HuntData, HuntListData, HuntPuzzleDetailData} from '#src/Structs/ControllerStructs';

/**
 * List of puzzle hunts. Swiftarr exposes this as a flex route (optional auth),
 * so this uses `useOpenQuery` rather than `useTokenAuthQuery`. The API client still
 * sends a bearer token when the user is logged in, which is how solved-puzzle
 * state is populated on subsequent hunt/puzzle fetches.
 */
export const useHuntsQuery = () => {
  return useOpenQuery<HuntListData>('/hunts');
};

interface HuntQueryOptions {
  huntID: string;
}

/**
 * Single hunt with currently unlocked puzzles.
 */
export const useHuntQuery = ({huntID}: HuntQueryOptions) => {
  return useOpenQuery<HuntData>(`/hunts/${huntID}`);
};

interface HuntPuzzleQueryOptions {
  puzzleID: string;
}

/**
 * Puzzle detail including the current user's call-in history.
 */
export const useHuntPuzzleQuery = ({puzzleID}: HuntPuzzleQueryOptions) => {
  return useOpenQuery<HuntPuzzleDetailData>(`/hunts/puzzles/${puzzleID}`);
};
