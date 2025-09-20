import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {PhotostreamListData, PhotostreamLocationData} from '../../../Libraries/Structs/ControllerStructs.tsx';

export const usePhotostreamQuery = () => {
  return useTokenAuthPaginationQuery<PhotostreamListData>('/photostream');
};

export const usePhotostreamLocationDataQuery = () => {
  return useTokenAuthQuery<PhotostreamLocationData>('/photostream/placenames');
};
