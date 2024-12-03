import {AxiosResponse} from 'axios';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface FezMembershipMutationProps {
  fezID: string;
  action: 'join' | 'unjoin';
}

export const useFezMembershipMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async ({fezID, action}: FezMembershipMutationProps): Promise<AxiosResponse<FezData>> => {
    return await ServerQueryClient.post(`/fez/${fezID}/${action}`);
  };

  return useTokenAuthMutation(queryHandler);
};
