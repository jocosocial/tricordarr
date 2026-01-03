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
