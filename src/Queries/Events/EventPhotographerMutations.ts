import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface EventPhotographerMutationProps {
  eventID: string;
  action: 'create' | 'delete';
}

export const useEventPhotographerMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({eventID, action}: EventPhotographerMutationProps) => {
    const endpoint = action === 'create' ? 'photographer' : 'photographer/remove';
    return await apiPost(`/events/${eventID}/${endpoint}`);
  };

  return useTokenAuthMutation(queryHandler);
};

interface EventNeedsPhotographerMutationProps {
  eventID: string;
  action: 'create' | 'delete';
}

export const useEventNeedsPhotographerMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const queryHandler = async ({eventID, action}: EventNeedsPhotographerMutationProps) => {
    if (action === 'delete') {
      return await apiDelete(`/events/${eventID}/needsphotographer`);
    }
    return await apiPost(`/events/${eventID}/needsphotographer`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Fetches the entire photography-coverage report as CSV from
 * `GET /api/v3/events/photographerreport/download`. Not paginated: the CSV holds every row
 * matching the optional cruise day filter.
 *
 * Uses ServerQueryClient (base URL `/api/v3`, bearer token) rather than PublicQueryClient,
 * because this is the token-auth API route. The Site UI has a cookie-session twin at the same
 * path without the `/api/v3` prefix; that one is not for us.
 *
 * @param cruiseDay Embarkation day is day 1. Omit for the whole cruise.
 */
export const useEventPhotographerReportDownloadMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async (cruiseDay?: number) => {
    const response = await ServerQueryClient.get<string>('/events/photographerreport/download', {
      responseType: 'text',
      headers: {Accept: 'text/csv'},
      params: cruiseDay ? {cruiseday: cruiseDay} : undefined,
    });
    return response.data;
  };

  return useTokenAuthMutation(queryHandler);
};
