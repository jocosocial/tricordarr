import {useCallback} from 'react';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useQuartermasterCacheReducer} from '#src/Hooks/Quartermaster/useQuartermasterCacheReducer';
import {alertDeleteQuartermasterItem} from '#src/Libraries/Alerts/QuartermasterAlerts';
import {useQuartermasterDeleteMutation} from '#src/Queries/Quartermaster/QuartermasterMutations';
import {QuartermasterData} from '#src/Structs/ControllerStructs';

interface QuartermasterDeleteOptions {
  /** Runs once the server has deleted the item and the caches have been patched. */
  onSuccess?: () => void;
  /** Runs when the request finishes, whether or not it succeeded. */
  onSettled?: () => void;
}

interface QuartermasterConfirmDeleteOptions extends QuartermasterDeleteOptions {
  /** Runs as soon as the user confirms, before the request starts. */
  onConfirm?: () => void;
}

/**
 * The one place a Quartermastarr item is deleted: the request, the cache patch, and the
 * confirmation snackbar. The caches are patched only once the server agrees, since a failed
 * delete must leave the item where it was.
 *
 * Callers disable their control with `isPending`, because a second tap during the request would
 * send a second delete.
 */
export const useQuartermasterDelete = () => {
  const {mutate, isPending} = useQuartermasterDeleteMutation();
  const {deleteItem} = useQuartermasterCacheReducer();
  const {setSnackbarPayload} = useSnackbar();

  /**
   * Deletes an item without asking. For callers that have already confirmed, such as the
   * moderator flow, which has its own wording.
   *
   * @param itemID The item to delete.
   * @param options Callbacks for success and completion.
   */
  const deleteNow = useCallback(
    (itemID: string, options?: QuartermasterDeleteOptions) => {
      mutate(
        {itemID},
        {
          onSuccess: () => {
            deleteItem(itemID);
            setSnackbarPayload({message: 'Item deleted.', messageType: 'info'});
            options?.onSuccess?.();
          },
          onSettled: options?.onSettled,
        },
      );
    },
    [mutate, deleteItem, setSnackbarPayload],
  );

  /**
   * Asks the user to confirm, then deletes the item.
   *
   * @param item The item to delete.
   * @param options Callbacks for confirmation, success and completion.
   */
  const confirmAndDelete = useCallback(
    (item: QuartermasterData, options?: QuartermasterConfirmDeleteOptions) => {
      alertDeleteQuartermasterItem(item.itemName, () => {
        options?.onConfirm?.();
        deleteNow(item.itemID, options);
      });
    },
    [deleteNow],
  );

  return {deleteNow, confirmAndDelete, isPending};
};
