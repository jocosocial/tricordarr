import {ProfilePublicData, UserProfileUploadData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface userProfileHandlerProps {
  userID?: string;
  profileData: UserProfileUploadData;
}

export const useUserProfileMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const userProfileHandler = async ({userID, profileData}: userProfileHandlerProps) => {
    const endpoint = userID === undefined ? '/user/profile' : `/user/${userID}/profile`;
    return await apiPost<ProfilePublicData, UserProfileUploadData>(endpoint, profileData);
  };

  return useTokenAuthMutation(userProfileHandler, {});
};
