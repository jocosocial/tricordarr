import {QueryKey, useQueryClient} from '@tanstack/react-query';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {invalidateQueryKeys} from '#src/Libraries/QueryInvalidation';
import {
  ModerationSetStatePath,
  useCloseReportsMutation,
  useHandleReportsMutation,
  useSetModerationStateMutation,
} from '#src/Queries/Moderation/ModerationMutations';
import {ModeratorActionLogResponseData, ReportModerationData} from '#src/Structs/ControllerStructs';

/**
 * Shared set-state / handle-reports / close-reports helpers for per-content moderate screens.
 */
export const useModerationContentActions = (cacheKeys: QueryKey[]) => {
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();
  const setStateMutation = useSetModerationStateMutation();
  const handleMutation = useHandleReportsMutation();
  const closeMutation = useCloseReportsMutation();
  const keys = cacheKeys.concat(ModeratorActionLogResponseData.getCacheKeys());

  const invalidate = async () => {
    await invalidateQueryKeys(queryClient, keys);
  };

  const setState = (path: ModerationSetStatePath, contentID: string, state: ContentModerationStatus) => {
    setStateMutation.mutate(
      {path, contentID, state},
      {
        onSuccess: async () => {
          await invalidate();
          setSnackbarPayload({
            message: `State set to ${ContentModerationStatus.getLabel(state)}.`,
            messageType: 'info',
          });
        },
      },
    );
  };

  const handleAll = (reports: ReportModerationData[]) => {
    const firstOpen = reports.find(report => !report.isClosed);
    if (!firstOpen) {
      return;
    }
    handleMutation.mutate(
      {reportID: firstOpen.id},
      {
        onSuccess: async () => {
          await invalidate();
          setSnackbarPayload({message: 'Reports marked as being handled.', messageType: 'info'});
        },
      },
    );
  };

  const closeAll = (reports: ReportModerationData[]) => {
    const firstOpen = reports.find(report => !report.isClosed);
    if (!firstOpen) {
      return;
    }
    closeMutation.mutate(
      {reportID: firstOpen.id},
      {
        onSuccess: async () => {
          await invalidate();
          setSnackbarPayload({message: 'Reports closed.', messageType: 'info'});
        },
      },
    );
  };

  return {
    setState,
    handleAll,
    closeAll,
    invalidate,
    isLoading: setStateMutation.isPending || handleMutation.isPending || closeMutation.isPending,
  };
};
