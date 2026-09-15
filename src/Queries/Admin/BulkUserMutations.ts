import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {BulkUserUpdateVerificationData} from '#src/Structs/AdminControllerStructs';

/**
 * Downloads the bulk user archive as a zip ArrayBuffer. Response is not JSON.
 */
export const useBulkUserDownloadMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const mutationFn = async () => {
    const response = await ServerQueryClient.get<ArrayBuffer>('/admin/bulkuserfile/download', {
      responseType: 'arraybuffer',
      maxContentLength: Infinity,
    });
    return response.data;
  };

  return useTokenAuthMutation(mutationFn);
};

export const useBulkUserUploadMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (file: {data: ArrayBuffer; filename: string}) => {
    return await apiPost('/admin/bulkuserfile/upload', file.data, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      BulkUserUpdateVerificationData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export const useBulkUserApplyMutation = () => {
  const {apiGet} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async () => {
    const response = await apiGet<BulkUserUpdateVerificationData, undefined>('/admin/bulkuserfile/update/apply');
    return response.data;
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      BulkUserUpdateVerificationData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
