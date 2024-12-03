import {useTokenAuthMutation} from '../TokenAuthMutation';
import {AxiosResponse} from 'axios';
import {ImageUploadData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const useUserAvatarMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const imageUploadHandler = async (imageUploadData: ImageUploadData): Promise<AxiosResponse<UserHeader>> => {
    return await ServerQueryClient.post('/user/image', imageUploadData);
  };

  return useTokenAuthMutation(imageUploadHandler);
};

export const useUserImageDeleteMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const imageDeleteHandler = async ({userID}: {userID?: string}): Promise<AxiosResponse<void>> => {
    const endpoint = userID ? '/user/:userID/image' : '/user/image';
    return await ServerQueryClient.delete(endpoint);
  };

  return useTokenAuthMutation(imageDeleteHandler);
};
