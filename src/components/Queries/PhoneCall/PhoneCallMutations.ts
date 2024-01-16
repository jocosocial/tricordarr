import {useTokenAuthMutation} from '../TokenAuthMutation';
import axios, {AxiosResponse} from 'axios';

const forumCreateQueryHandler = async ({callID}: {callID: string}): Promise<AxiosResponse<void>> => {
  return await axios.post(`/phone/decline/${callID}`);
};

export const usePhoneCallDeclineMutation = () => {
  return useTokenAuthMutation(forumCreateQueryHandler);
};
