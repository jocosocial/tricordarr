import {STALE} from '#src/Libraries/Time/Time';
import {useOpenQuery} from '#src/Queries/OpenQuery';
import {DailyThemeData} from '#src/Structs/ControllerStructs';

/**
 * Retrieve the list of daily themes for the cruise.
 * Login not required - Swiftarr serves this via a flex route so anonymous/pre-registration
 * users can see it too (matches /notification/global in NotificationQueries.ts).
 */
export const useDailyThemeQuery = (options = {}) => {
  return useOpenQuery<DailyThemeData[]>('/notification/dailythemes', {
    staleTime: STALE.HOURS.TWENTY_FOUR,
    ...options,
  });
};
