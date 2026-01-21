import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {PhotostreamListData, PhotostreamLocationData} from '#src/Structs/ControllerStructs';

interface PhotostreamQueryOptions {
  eventID?: string;
  locationName?: string;
}

export const usePhotostreamQuery = ({eventID, locationName}: PhotostreamQueryOptions = {}) => {
  const queryParams = {
    ...(eventID && {eventID: eventID}),
    ...(locationName && {locationName: locationName}),
  };
  return useTokenAuthPaginationQuery<PhotostreamListData>('/photostream', undefined, queryParams);
};

export const usePhotostreamEventQuery = (eventID: string) => {
  return usePhotostreamQuery({eventID});
};

export const usePhotostreamLocationDataQuery = () => {
  return useTokenAuthQuery<PhotostreamLocationData>('/photostream/placenames');
};
