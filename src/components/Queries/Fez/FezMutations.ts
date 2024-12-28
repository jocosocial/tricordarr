import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';
import {FezContentData, FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';
import {WithFezID} from '../../../libraries/Types';

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
