import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {PhotostreamListData, PhotostreamLocationData} from '#src/Structs/ControllerStructs';

interface PhotostreamQueryOptions {
  eventID?: string;
  locationName?: string;
  byUser?: string;
}

export const usePhotostreamQuery = ({eventID, locationName, byUser}: PhotostreamQueryOptions = {}) => {
  const queryParams = {
    ...(eventID && {eventID: eventID}),
    ...(locationName && {locationName: locationName}),
    ...(byUser && {byUser: byUser}),
  };
  return useTokenAuthPaginationQuery<PhotostreamListData>('/photostream', undefined, queryParams);
};

export const usePhotostreamEventQuery = (eventID: string) => {
  return usePhotostreamQuery({eventID});
};

export const usePhotostreamUserQuery = (userID: string) => {
  return usePhotostreamQuery({byUser: userID});
};

export const usePhotostreamLocationDataQuery = () => {
  return useTokenAuthQuery<PhotostreamLocationData>('/photostream/placenames');
};
