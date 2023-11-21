import {useTokenAuthMutation} from '../TokenAuthMutation';
import axios, {AxiosResponse} from 'axios';
import {ImageUploadData, UserHeader} from '../../../libraries/Structs/ControllerStructs';

export const imageUploadHandler = async (imageUploadData: ImageUploadData): Promise<AxiosResponse<UserHeader>> => {
  return await axios.post('/user/image', imageUploadData);
};

export const imageDeleteHandler = async ({userID}: {userID?: string}): Promise<AxiosResponse<void>> => {
  const endpoint = userID ? '/user/:userID/image' : '/user/image';
  return await axios.delete(endpoint);
};

export const useUserAvatarMutation = () => {
  return useTokenAuthMutation(imageUploadHandler);
};

export const useUserImageDeleteMutation = () => {
  return useTokenAuthMutation(imageDeleteHandler);
};
