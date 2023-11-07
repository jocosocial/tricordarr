import axios, {AxiosError, AxiosResponse} from 'axios';
import {useMutation} from '@tanstack/react-query';
import {ErrorResponse, EventData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

interface EventFavoriteMutationProps {
  eventID: string;
  action: 'favorite' | 'unfavorite';
}

const queryHandler = async ({eventID, action}: EventFavoriteMutationProps): Promise<AxiosResponse<void>> => {
  // We don't do the same [/favorite, /unfavorite] endpoints like we do for users.
  const endpoint = action === 'favorite' ? 'favorite' : 'favorite/remove';
  return await axios.post(`/events/${eventID}/${endpoint}`);
};

export const useEventFavoriteMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<void>, AxiosError<ErrorResponse>, EventFavoriteMutationProps>(queryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason || error.message);
    },
  });
};

export const useEventFavoritesQuery = () => {
  return useTokenAuthQuery<EventData[]>({
    queryKey: ['/events/favorites'],
  });
};
