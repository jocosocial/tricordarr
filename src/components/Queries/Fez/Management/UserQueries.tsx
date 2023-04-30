import axios, {AxiosError, AxiosResponse} from 'axios';
import {useMutation} from '@tanstack/react-query';
import {ErrorResponse, FezData} from '../../../../libraries/Structs/ControllerStructs';

interface ParticipantMutationProps {
  fezID: string;
  userID: string;
  action: 'add' | 'remove';
}

const queryHandler = async ({fezID, userID, action}: ParticipantMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post(`/fez/${fezID}/user/${userID}/${action}`);
};

export const useFezParticipantMutation = (retry = 0) => {
  return useMutation<AxiosResponse<FezData>, AxiosError<ErrorResponse>, ParticipantMutationProps>(queryHandler, {
    retry: retry,
  });
};
