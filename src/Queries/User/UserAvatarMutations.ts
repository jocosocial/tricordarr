import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {ImageUploadData, UserHeader} from '#src/Structs/ControllerStructs';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

export const useUserAvatarMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const imageUploadHandler = async (imageUploadData: ImageUploadData) => {
    return await apiPost<UserHeader, ImageUploadData>('/user/image', imageUploadData);
  };

  return useTokenAuthMutation(imageUploadHandler);
};

export const useUserImageDeleteMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  const imageDeleteHandler = async ({userID}: {userID?: string}) => {
    const endpoint = userID ? '/user/:userID/image' : '/user/image';
    return await apiDelete(endpoint);
  };

  return useTokenAuthMutation(imageDeleteHandler);
};
