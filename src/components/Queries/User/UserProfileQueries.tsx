import axios, {AxiosError, AxiosResponse} from 'axios';
import {ErrorResponse, ProfilePublicData, UserProfileUploadData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface userProfileHandlerProps {
  userID?: string;
  profileData: UserProfileUploadData;
}

const userProfileHandler = async ({
  userID,
  profileData,
}: userProfileHandlerProps): Promise<AxiosResponse<ProfilePublicData>> => {
  const endpoint = userID === undefined ? '/user/profile' : `/user/${userID}/profile`;
  return await axios.post(endpoint, profileData);
};

export const useUserProfileMutation = () => {
  return useTokenAuthMutation<AxiosResponse<ProfilePublicData>, AxiosError<ErrorResponse>, userProfileHandlerProps>(
    userProfileHandler,
    {},
  );
};
