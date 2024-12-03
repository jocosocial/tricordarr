import {AxiosResponse} from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface EventFavoriteMutationProps {
  eventID: string;
  action: 'favorite' | 'unfavorite';
}

export const useEventFavoriteMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async ({eventID, action}: EventFavoriteMutationProps): Promise<AxiosResponse<void>> => {
    // We don't do the same [/favorite, /unfavorite] endpoints like we do for users.
    const endpoint = action === 'favorite' ? 'favorite' : 'favorite/remove';
    return await ServerQueryClient.post(`/events/${eventID}/${endpoint}`);
  };

  return useTokenAuthMutation(queryHandler);
};
