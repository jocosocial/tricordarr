import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface EventFavoriteMutationProps {
  eventID: string;
  action: 'favorite' | 'unfavorite';
}

export const useEventFavoriteMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({eventID, action}: EventFavoriteMutationProps) => {
    // We don't do the same [/favorite, /unfavorite] endpoints like we do for users.
    const endpoint = action === 'favorite' ? 'favorite' : 'favorite/remove';
    return await apiPost(`/events/${eventID}/${endpoint}`);
  };

  return useTokenAuthMutation(queryHandler);
};
