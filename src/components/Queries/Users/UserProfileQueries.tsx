import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserProfileQuery = (userID: string) => {
  return useTokenAuthQuery<ProfilePublicData>({
    queryKey: [`/users/${userID}/profile`],
  });
};
