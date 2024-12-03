import {useTokenAuthMutation} from '../TokenAuthMutation';
import {AxiosResponse} from 'axios';
import {TokenStringData, UserRecoveryData} from '../../../libraries/Structs/ControllerStructs';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const useUserRecoveryMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const recoveryHandler = async (recoveryData: UserRecoveryData): Promise<AxiosResponse<TokenStringData>> => {
    return await ServerQueryClient.post('/auth/recovery', recoveryData);
  };

  return useTokenAuthMutation(recoveryHandler);
};
