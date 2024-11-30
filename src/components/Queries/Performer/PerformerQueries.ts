import {useTokenAuthPaginationQuery} from '../TokenAuthQuery.ts';
import {PerformerResponseData} from '../../../libraries/Structs/ControllerStructs.tsx';

export type PerformerType = 'official' | 'shadow';

export const usePerformersQuery = (performerType: PerformerType) => {
  return useTokenAuthPaginationQuery<PerformerResponseData>(`/performer/${performerType}`);
};
