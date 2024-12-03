import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserProfileQuery = (userID?: string, options = {}) => {
  return useTokenAuthQuery<ProfilePublicData>(`/users/${userID}/profile`, options);
};
