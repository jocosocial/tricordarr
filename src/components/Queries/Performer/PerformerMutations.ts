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
    return await apiPost(`/performer/forevent/${props.eventID}`, props.performerData);
  };

  return useTokenAuthMutation(queryHandler);
};

export const usePerformerDeleteMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  const queryHandler = async () => {
    return await apiDelete('/performer/self');
  };

  return useTokenAuthMutation(queryHandler);
};
