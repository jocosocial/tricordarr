import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {FezPostData, PostContentData} from '#src/Structs/ControllerStructs';

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

/**
 * Deletes a fez post. Moderators can delete posts they did not author.
 * POST /api/v3/fez/post/:id/delete
 */
export const useFezPostDeleteMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({postID}: {postID: string}) => {
    return await apiPost(`/fez/post/${postID}/delete`);
  };

  return useTokenAuthMutation(queryHandler);
};
