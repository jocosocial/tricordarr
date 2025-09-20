import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {PerformerData, PerformerResponseData} from '../../../Libraries/Structs/ControllerStructs.tsx';

export type PerformerType = 'official' | 'shadow';

export const usePerformersQuery = (performerType: PerformerType) => {
  return useTokenAuthPaginationQuery<PerformerResponseData>(`/performer/${performerType}`);
};

export const usePerformerQuery = (performer: string) => {
  return useTokenAuthQuery<PerformerData>(`/performer/${performer}`);
};

export const usePerformerSelfQuery = () => {
  return useTokenAuthQuery<PerformerData>('/performer/self');
};
