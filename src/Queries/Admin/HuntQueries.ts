import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {HuntData, HuntListData} from '#src/Structs/ControllerStructs';

export const useHuntsQuery = (options = {}) => {
  return useTokenAuthQuery<HuntListData>('/hunts', options);
};

export const useHuntAdminQuery = ({huntID}: {huntID: string}, options = {}) => {
  return useTokenAuthQuery<HuntData>(`/hunts/${huntID}/admin`, options);
};
