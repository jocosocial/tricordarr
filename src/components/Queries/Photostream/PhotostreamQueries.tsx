import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {
  PhotostreamListData,
  PhotostreamLocationData,
  PhotostreamUploadData,
} from '../../../libraries/Structs/ControllerStructs.tsx';
import axios, {AxiosResponse} from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';

export const usePhotostreamQuery = () => {
  return useTokenAuthPaginationQuery<PhotostreamListData>('/photostream');
};

export const usePhotostreamLocationDataQuery = () => {
  return useTokenAuthQuery<PhotostreamLocationData>('/photostream/placenames');
};

interface PhotostreamImageMutationProps {
  imageUploadData: PhotostreamUploadData;
}

const queryHandler = async ({imageUploadData}: PhotostreamImageMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.post('/photostream/upload', imageUploadData);
};

export const usePhotostreamImageUploadMutation = () => {
  return useTokenAuthMutation(queryHandler);
};

// There is no delete handler. Per cfry 2024/08/27:
// Mods can delete photos, and letting users delete their photos increases
// the chance people will try posting bad photos and quickly deleting them
// before they can be reported.
