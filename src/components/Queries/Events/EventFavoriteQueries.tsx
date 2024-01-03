import axios, {AxiosResponse} from 'axios';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface EventFavoriteMutationProps {
  eventID: string;
  action: 'favorite' | 'unfavorite';
}

const queryHandler = async ({eventID, action}: EventFavoriteMutationProps): Promise<AxiosResponse<void>> => {
  // We don't do the same [/favorite, /unfavorite] endpoints like we do for users.
  const endpoint = action === 'favorite' ? 'favorite' : 'favorite/remove';
  return await axios.post(`/events/${eventID}/${endpoint}`);
};

export const useEventFavoriteMutation = () => {
  return useTokenAuthMutation(queryHandler);
};

interface EventFavoriteQueryProps {
  enabled?: boolean;
}

export const useEventFavoritesQuery = ({enabled}: EventFavoriteQueryProps = {enabled: true}) => {
  return useTokenAuthQuery<EventData[]>({
    queryKey: ['/events/favorites'],
    enabled: enabled,
  });
};
