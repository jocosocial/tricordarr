import axios, {AxiosResponse} from 'axios';
import {PersonalEventContentData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';

interface PersonalEventCreateMutationProps {
  personalEventContentData: PersonalEventContentData;
}

interface PersonalEventUpdateMutationProps extends PersonalEventCreateMutationProps {
  personalEventID: string;
}

const personalEventUpdateQueryHandler = async ({
  personalEventID,
  personalEventContentData,
}: PersonalEventUpdateMutationProps): Promise<AxiosResponse<PersonalEventData>> => {
  return await axios.post(`/personalevents/${personalEventID}/update`, personalEventContentData);
};

export const usePersonalEventUpdateMutation = () => {
  return useTokenAuthMutation(personalEventUpdateQueryHandler);
};

const personalEventCreateQueryHandler = async ({
  personalEventContentData,
}: PersonalEventCreateMutationProps): Promise<AxiosResponse<PersonalEventData>> => {
  return await axios.post('/personalevents/create', personalEventContentData);
};

export const usePersonalEventCreateMutation = () => {
  return useTokenAuthMutation(personalEventCreateQueryHandler);
};
