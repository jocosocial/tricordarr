import {AxiosError, AxiosResponse} from 'axios';
import {ErrorResponse, ProfilePublicData, UserProfileUploadData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface userProfileHandlerProps {
  userID?: string;
  profileData: UserProfileUploadData;
}

export const useUserProfileMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const userProfileHandler = async ({
    userID,
    profileData,
  }: userProfileHandlerProps): Promise<AxiosResponse<ProfilePublicData>> => {
    const endpoint = userID === undefined ? '/user/profile' : `/user/${userID}/profile`;
    return await ServerQueryClient.post(endpoint, profileData);
  };

  return useTokenAuthMutation<AxiosResponse<ProfilePublicData>, AxiosError<ErrorResponse>, userProfileHandlerProps>(
    userProfileHandler,
    {},
  );
};
