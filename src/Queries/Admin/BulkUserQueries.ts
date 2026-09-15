import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {BulkUserUpdateVerificationData} from '#src/Structs/AdminControllerStructs';

export const useBulkUserVerifyQuery = (options = {}) => {
  return useTokenAuthQuery<BulkUserUpdateVerificationData>('/admin/bulkuserfile/verify', options);
};
