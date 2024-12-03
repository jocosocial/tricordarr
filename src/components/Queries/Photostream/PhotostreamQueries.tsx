import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {
  PhotostreamListData,
  PhotostreamLocationData,
  PhotostreamUploadData,
} from '../../../libraries/Structs/ControllerStructs.tsx';
import {AxiosResponse} from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const usePhotostreamQuery = () => {
  return useTokenAuthPaginationQuery<PhotostreamListData>('/photostream');
};

export const usePhotostreamLocationDataQuery = () => {
  return useTokenAuthQuery<PhotostreamLocationData>('/photostream/placenames');
};

interface PhotostreamImageMutationProps {
  imageUploadData: PhotostreamUploadData;
}

export const usePhotostreamImageUploadMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async ({imageUploadData}: PhotostreamImageMutationProps): Promise<AxiosResponse<void>> => {
    return await ServerQueryClient.post('/photostream/upload', imageUploadData);
  };

  return useTokenAuthMutation(queryHandler);
};

// There is no delete handler. Per cfry 2024/08/27:
// Mods can delete photos, and letting users delete their photos increases
// the chance people will try posting bad photos and quickly deleting them
// before they can be reported.
