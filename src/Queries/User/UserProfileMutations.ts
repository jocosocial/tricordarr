import {ProfilePublicData, UserProfileUploadData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';
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
