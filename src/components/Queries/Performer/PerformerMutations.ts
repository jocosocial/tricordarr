import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';
import {PerformerUploadData} from '../../../libraries/Structs/ControllerStructs.tsx';

export const usePerformerCreateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  interface QueryHandlerProps {
    eventID: string;
    performerData: PerformerUploadData;
  }

  const queryHandler = async (props: QueryHandlerProps) => {
    return await apiPost(`/api/v3/performer/forEvent/${props.eventID}`, props.performerData);
  };

  return useTokenAuthMutation(queryHandler);
};

export const usePerformerDeleteMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  const queryHandler = async () => {
    return await apiDelete('/performer/self/performer');
  };

  return useTokenAuthMutation(queryHandler);
};
