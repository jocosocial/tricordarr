import {useTokenAuthMutation} from '../TokenAuthMutation';
import {AxiosResponse} from 'axios';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const usePhoneCallDeclineMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const forumCreateQueryHandler = async ({callID}: {callID: string}): Promise<AxiosResponse<void>> => {
    return await ServerQueryClient.post(`/phone/decline/${callID}`);
  };

  return useTokenAuthMutation(forumCreateQueryHandler);
};
