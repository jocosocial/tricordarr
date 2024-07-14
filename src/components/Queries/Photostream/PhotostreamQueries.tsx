import {useTokenAuthPaginationQuery} from '../TokenAuthQuery.ts';
import {PhotostreamListData} from '../../../libraries/Structs/ControllerStructs.tsx';

export const usePhotostreamQuery = () => {
  return useTokenAuthPaginationQuery<PhotostreamListData>('/photostream');
};
