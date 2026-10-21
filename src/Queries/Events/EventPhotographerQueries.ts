import {TokenAuthPaginationQueryOptionsTypeV2, useTokenAuthPaginationQuery} from '#src/Queries/TokenAuthQuery';
import {ShutternautScheduleReportResponseData} from '#src/Structs/ControllerStructs';

export interface EventPhotographerReportQueryParams {
  /// Embarkation day is day 1 (Event indexing, not Fez/LFG indexing). Omit for the whole cruise.
  cruiseday?: number;
}

/**
 * Paginated photography-coverage report from `GET /api/v3/events/photographerreport`.
 * Swiftarr restricts this to Shutternaut Managers and TwitarrTeam and above; everyone else gets a 403.
 *
 * @param queryParams Optional cruise day filter. Omit the param entirely for all days.
 * @param options Standard pagination query options.
 */
export const useEventPhotographerReportQuery = (
  queryParams?: EventPhotographerReportQueryParams,
  options?: TokenAuthPaginationQueryOptionsTypeV2<ShutternautScheduleReportResponseData>,
) => {
  return useTokenAuthPaginationQuery<ShutternautScheduleReportResponseData, EventPhotographerReportQueryParams>(
    '/events/photographerreport',
    options,
    queryParams,
  );
};
