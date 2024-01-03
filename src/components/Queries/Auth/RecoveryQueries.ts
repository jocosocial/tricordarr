import {useTokenAuthMutation} from '../TokenAuthMutation';
import axios, {AxiosResponse} from 'axios';
import {TokenStringData, UserRecoveryData} from '../../../libraries/Structs/ControllerStructs';

const recoveryHandler = async (recoveryData: UserRecoveryData): Promise<AxiosResponse<TokenStringData>> => {
  return await axios.post('/auth/recovery', recoveryData);
};

export const useUserRecoveryMutation = () => {
  return useTokenAuthMutation(recoveryHandler);
};
