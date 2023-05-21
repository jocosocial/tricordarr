import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserProfileQuery = () => {
  return useTokenAuthQuery<ProfilePublicData>({
    queryKey: ['/user/profile'],
  });
};
