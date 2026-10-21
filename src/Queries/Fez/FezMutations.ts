import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {FezContentData, FezData} from '#src/Structs/ControllerStructs';
import {WithFezID} from '#src/Types';

interface FezCreateMutationProps {
  fezContentData: FezContentData;
}

export const useFezCreateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const fezCreateQueryHandler = async ({fezContentData}: FezCreateMutationProps) => {
    return await apiPost<FezData, FezContentData>('/fez/create', fezContentData);
  };

  return useTokenAuthMutation(fezCreateQueryHandler);
};

interface FezUpdateMutationProps extends FezCreateMutationProps {
  fezID: string;
}

export const useFezUpdateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const fezUpdateQueryHandler = async ({fezID, fezContentData}: FezUpdateMutationProps) => {
    return await apiPost<FezData, FezContentData>(`/fez/${fezID}/update`, fezContentData);
  };

  return useTokenAuthMutation(fezUpdateQueryHandler);
};

/**
 * Marks all posts in a chat as read without fetching them.
 * POST /api/v3/fez/:fez_ID/markRead
 */
export const useFezMarkReadMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const fezMarkReadQueryHandler = async ({fezID}: WithFezID) => {
    return await apiPost(`/fez/${fezID}/markRead`);
  };

  return useTokenAuthMutation(fezMarkReadQueryHandler);
};

export const useFezCancelMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const cancelQueryHandler = async ({fezID}: WithFezID) => {
    return await apiPost<FezData>(`/fez/${fezID}/cancel`);
  };

  return useTokenAuthMutation(cancelQueryHandler);
};

export const useFezDeleteMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  const deleteQueryHandler = async ({fezID}: WithFezID) => {
    return await apiDelete(`/fez/${fezID}`);
  };

  return useTokenAuthMutation(deleteQueryHandler);
};
