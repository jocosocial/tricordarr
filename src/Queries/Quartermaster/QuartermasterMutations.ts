import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {QuartermasterContentData, QuartermasterCreateData, QuartermasterData} from '#src/Structs/ControllerStructs';

/**
 * Creates one or more Quartermastarr items. Returns the created items.
 * POST /api/v3/quartermaster/create
 */
export const useQuartermasterCreateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({createData}: {createData: QuartermasterCreateData}) => {
    return await apiPost<QuartermasterData[], QuartermasterCreateData>('/quartermaster/create', createData);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Replaces the contents of a Quartermastarr item. Returns the updated item.
 * POST /api/v3/quartermaster/:id/update
 */
export const useQuartermasterUpdateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({itemID, contentData}: {itemID: string; contentData: QuartermasterContentData}) => {
    return await apiPost<QuartermasterData, QuartermasterContentData>(`/quartermaster/${itemID}/update`, contentData);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Soft-deletes a Quartermastarr item. Allowed for the owner (while the item is not
 * quarantined or locked) and for moderators.
 * POST /api/v3/quartermaster/:id/delete
 */
export const useQuartermasterDeleteMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({itemID}: {itemID: string}) => {
    return await apiPost(`/quartermaster/${itemID}/delete`);
  };

  return useTokenAuthMutation(queryHandler);
};
