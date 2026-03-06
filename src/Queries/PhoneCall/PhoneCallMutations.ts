import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

export const usePhoneCallDeclineMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const forumCreateQueryHandler = async ({callID}: {callID: string}) => {
    return await apiPost(`/phone/decline/${callID}`);
  };

  return useTokenAuthMutation(forumCreateQueryHandler);
};

export const usePhoneCallAnswerMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const answerQueryHandler = async ({callID}: {callID: string}) => {
    return await apiPost(`/phone/answer/${callID}`);
  };

  return useTokenAuthMutation(answerQueryHandler);
};
