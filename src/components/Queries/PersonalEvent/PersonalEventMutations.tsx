import {AxiosResponse} from 'axios';
import {PersonalEventContentData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface PersonalEventCreateMutationProps {
  personalEventContentData: PersonalEventContentData;
}

interface PersonalEventDeleteMutationProps {
  personalEventID: string;
}

interface PersonalEventUpdateMutationProps extends PersonalEventCreateMutationProps, PersonalEventDeleteMutationProps {}

export const usePersonalEventUpdateMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const personalEventUpdateQueryHandler = async ({
    personalEventID,
    personalEventContentData,
  }: PersonalEventUpdateMutationProps): Promise<AxiosResponse<PersonalEventData>> => {
    return await ServerQueryClient.post(`/personalevents/${personalEventID}/update`, personalEventContentData);
  };

  return useTokenAuthMutation(personalEventUpdateQueryHandler);
};

export const usePersonalEventCreateMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const personalEventCreateQueryHandler = async ({
    personalEventContentData,
  }: PersonalEventCreateMutationProps): Promise<AxiosResponse<PersonalEventData>> => {
    return await ServerQueryClient.post('/personalevents/create', personalEventContentData);
  };

  return useTokenAuthMutation(personalEventCreateQueryHandler);
};

export const usePersonalEventDeleteMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();
  const deleteQueryHandler = async ({
    personalEventID,
  }: PersonalEventDeleteMutationProps): Promise<AxiosResponse<void>> => {
    return await ServerQueryClient.delete(`/personalevents/${personalEventID}`);
  };
  return useTokenAuthMutation(deleteQueryHandler);
};
