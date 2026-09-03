import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

/**
 * Fetches a single event's ICS from the site route `GET /events/:id/calendarevent.ics`.
 * This is an open (unauthenticated) site path, not `/api/v3`.
 */
export const useEventIcsDownloadMutation = () => {
  const {PublicQueryClient} = useSwiftarrQueryClient();

  const mutationFn = async (eventID: string) => {
    const response = await PublicQueryClient.get<string>(`/events/${eventID}/calendarevent.ics`, {
      responseType: 'text',
      headers: {Accept: 'text/calendar'},
    });
    return response.data;
  };

  return useTokenAuthMutation(mutationFn);
};
