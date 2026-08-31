import {UseQueryOptions} from '@tanstack/react-query';
import {AxiosError} from 'axios';

import {useOpenQuery} from '#src/Queries/OpenQuery';
import {ErrorResponse, HuntData, HuntListData, HuntPuzzleDetailData} from '#src/Structs/ControllerStructs';

export type HuntOpenQueryOptions<TData> = Omit<
  UseQueryOptions<TData, AxiosError<ErrorResponse>, TData>,
  'initialData' | 'queryKey'
> & {
  initialData?: () => undefined;
};

/**
 * List of puzzle hunts. Swiftarr GETs are flex routes (optional auth), so this uses
 * `useOpenQuery`. The API client still sends a bearer token when logged in.
 */
export const useHuntsQuery = (options?: HuntOpenQueryOptions<HuntListData>) => {
  return useOpenQuery<HuntListData>('/hunts', options);
};

interface HuntQueryOptions {
  huntID: string;
  options?: HuntOpenQueryOptions<HuntData>;
}

/**
 * Single hunt with currently unlocked puzzles.
 */
export const useHuntQuery = ({huntID, options}: HuntQueryOptions) => {
  return useOpenQuery<HuntData>(`/hunts/${huntID}`, options);
};

interface HuntPuzzleQueryOptions {
  puzzleID: string;
  options?: HuntOpenQueryOptions<HuntPuzzleDetailData>;
}

/**
 * Puzzle detail including the current user's call-in history.
 */
export const useHuntPuzzleQuery = ({puzzleID, options}: HuntPuzzleQueryOptions) => {
  return useOpenQuery<HuntPuzzleDetailData>(`/hunts/puzzles/${puzzleID}`, options);
};
