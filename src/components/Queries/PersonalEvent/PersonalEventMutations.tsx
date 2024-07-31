import axios, {AxiosResponse} from 'axios';
import {FezData, PersonalEventContentData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';

interface PersonalEventCreateMutationProps {
  personalEventContentData: PersonalEventContentData;
}

interface PersonalEventDeleteMutationProps {
  personalEventID: string;
}

interface PersonalEventUpdateMutationProps extends PersonalEventCreateMutationProps, PersonalEventDeleteMutationProps {}

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

const deleteQueryHandler = async ({
  personalEventID,
}: PersonalEventDeleteMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.delete(`/personalevents/${personalEventID}`);
};

export const usePersonalEventDeleteMutation = () => {
  return useTokenAuthMutation(deleteQueryHandler);
};
