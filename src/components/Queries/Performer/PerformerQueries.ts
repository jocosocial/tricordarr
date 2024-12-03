import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {PerformerData, PerformerResponseData} from '../../../libraries/Structs/ControllerStructs.tsx';

export type PerformerType = 'official' | 'shadow';

export const usePerformersQuery = (performerType: PerformerType) => {
  return useTokenAuthPaginationQuery<PerformerResponseData>(`/performer/${performerType}`);
};

export const usePerformerQuery = (performer: string) => {
  return useTokenAuthQuery<PerformerData>(`/performer/${performer}`);
};
