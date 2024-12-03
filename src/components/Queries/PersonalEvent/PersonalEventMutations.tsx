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
  const {apiPost} = useSwiftarrQueryClient();

  const personalEventUpdateQueryHandler = async ({
    personalEventID,
    personalEventContentData,
  }: PersonalEventUpdateMutationProps) => {
    return await apiPost<PersonalEventData, PersonalEventContentData>(
      `/personalevents/${personalEventID}/update`,
      personalEventContentData,
    );
  };

  return useTokenAuthMutation(personalEventUpdateQueryHandler);
};

export const usePersonalEventCreateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const personalEventCreateQueryHandler = async ({personalEventContentData}: PersonalEventCreateMutationProps) => {
    return await apiPost<PersonalEventData, PersonalEventContentData>(
      '/personalevents/create',
      personalEventContentData,
    );
  };

  return useTokenAuthMutation(personalEventCreateQueryHandler);
};

export const usePersonalEventDeleteMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  const deleteQueryHandler = async ({personalEventID}: PersonalEventDeleteMutationProps) => {
    return await apiDelete(`/personalevents/${personalEventID}`);
  };

  return useTokenAuthMutation(deleteQueryHandler);
};
