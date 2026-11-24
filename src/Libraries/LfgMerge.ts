import {FezData} from '#src/Structs/ControllerStructs';
import {LfgListEndpoint} from '#src/Types';

interface MergeLfgListsInput {
  /** Every LFG the user has joined or created, in any order. Must be the complete set. */
  joined: FezData[];
  /** The LFGs loaded so far from /fez/open, in the API's order (start time, then title). */
  open: FezData[];
  /** True once there are no more /fez/open pages to load. */
  openComplete: boolean;
}

/**
 * Orders LFGs the way /fez/open does: start time ascending, then title.
 */
export const compareLfgByStartTime = (a: FezData, b: FezData): number => {
  const aTime = a.startTime ? Date.parse(a.startTime) : 0;
  const bTime = b.startTime ? Date.parse(b.startTime) : 0;
  if (aTime !== bTime) {
    return aTime - bTime;
  }
  return (a.title ?? '').localeCompare(b.title ?? '');
};

/**
 * Merges the user's joined/owned LFGs into the paged /fez/open list as one list sorted by start
 * time. /fez/open is sorted by start time but /fez/joined is not, so joined has to be loaded in
 * full and sorted here. A joined LFG is only shown once it falls at or before the last open LFG
 * loaded so far (or open is exhausted); otherwise it would appear too early and then shift as
 * further open pages arrive. The two endpoints are disjoint, but if an LFG is in both (e.g. it was
 * just joined and the open list is stale) the joined copy wins.
 */
export const mergeLfgLists = ({joined, open, openComplete}: MergeLfgListsInput): FezData[] => {
  const joinedIDs = new Set(joined.map(fez => fez.fezID));
  const openOnly = open.filter(fez => !joinedIDs.has(fez.fezID));
  const lastOpen = open[open.length - 1];
  const sortedJoined = [...joined].sort(compareLfgByStartTime);
  const visibleJoined =
    openComplete || !lastOpen ? sortedJoined : sortedJoined.filter(fez => compareLfgByStartTime(fez, lastOpen) <= 0);
  // When nothing from open has loaded yet and open is not complete, there is no cutoff to compare
  // against. Show no joined LFGs rather than a list that will reshuffle; the caller treats an
  // unfinished first open page as loading.
  const joinedToMerge = !openComplete && !lastOpen ? [] : visibleJoined;

  const merged: FezData[] = [];
  let i = 0;
  let j = 0;
  while (i < joinedToMerge.length || j < openOnly.length) {
    if (
      j >= openOnly.length ||
      (i < joinedToMerge.length && compareLfgByStartTime(joinedToMerge[i], openOnly[j]) <= 0)
    ) {
      merged.push(joinedToMerge[i++]);
    } else {
      merged.push(openOnly[j++]);
    }
  }
  return merged;
};

interface LfgSourcePlanInput {
  endpoint: LfgListEndpoint;
  onlyNew?: boolean;
  favorite?: boolean;
  cancelledOnly?: boolean;
  enabled?: boolean;
}

/**
 * Decides which Swiftarr endpoints back an LFG list source. Only 'all' ever uses /fez/open, and it
 * drops it when Favorites, Unread or Cancelled is set: open LFGs have no participant data and
 * /fez/open never returns cancelled LFGs, so they can never match, and the list is joined only.
 *
 * `loadAll` is set when the cancelled filter is applied on the client to an endpoint that is paged
 * by the server: a page can filter down to nothing, so every page is loaded before filtering.
 */
export const getLfgSourcePlan = ({
  endpoint,
  onlyNew,
  favorite,
  cancelledOnly = false,
  enabled = true,
}: LfgSourcePlanInput) => {
  const memberOnly = favorite === true || onlyNew !== undefined || cancelledOnly;
  return {
    memberOnly,
    loadAllJoined: enabled && (endpoint === 'all' || (cancelledOnly && endpoint === 'joined')),
    loadAllDirect: enabled && cancelledOnly && endpoint === 'owner',
    openEnabled: enabled && endpoint === 'all' && !memberOnly,
    joinedEnabled: enabled && (endpoint === 'all' || endpoint === 'joined'),
    directEnabled: enabled && (endpoint === 'owner' || endpoint === 'former'),
  };
};

/**
 * Keeps only cancelled LFGs when the Cancelled filter is on. Swiftarr has no query parameter for
 * this (only /fez/open excludes cancelled LFGs, unconditionally), so it is applied to the loaded
 * list on the client. It is an explicit user filter, unlike blocks, which are left entirely to the
 * API.
 */
export const onlyCancelledLfgs = (fezzes: FezData[], cancelledOnly: boolean): FezData[] =>
  cancelledOnly ? fezzes.filter(fez => fez.cancelled) : fezzes;
