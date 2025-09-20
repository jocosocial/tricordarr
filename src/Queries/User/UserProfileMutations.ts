import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {ProfilePublicData, UserProfileUploadData} from '#src/Structs/ControllerStructs';

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
