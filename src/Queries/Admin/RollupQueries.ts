import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {ServerRollupData} from '#src/Structs/AdminControllerStructs';

export const useAdminRollupQuery = (options = {}) => {
  return useTokenAuthQuery<ServerRollupData>('/admin/rollup', options);
};
