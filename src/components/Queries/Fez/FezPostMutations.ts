import {FezPostData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface FezPostMutationProps {
  fezID: string;
  postContentData: PostContentData;
}

export const useFezPostMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({fezID, postContentData}: FezPostMutationProps) => {
    return await apiPost<FezPostData, PostContentData>(`/fez/${fezID}/post`, postContentData);
  };

  return useTokenAuthMutation(queryHandler);
};
