import {useCallback} from 'react';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {alertCancel, alertDelete, alertLeave} from '#src/Libraries/Alerts/FezAlerts';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {LfgStackComponents} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {useFezMembershipMutation} from '#src/Queries/Fez/FezMembershipQueries';
import {useFezCancelMutation, useFezDeleteMutation} from '#src/Queries/Fez/FezMutations';
import {FezData} from '#src/Structs/ControllerStructs';

export const useFezAlert = (fezData?: FezData) => {
  const {setSnackbarPayload} = useSnackbar();
  const cancelMutation = useFezCancelMutation();
  const deleteMutation = useFezDeleteMutation();
  const membershipMutation = useFezMembershipMutation();
  const {cancelFez, deleteFez, updateMembership} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const navigation = useCommonStack();

  const confirmCancel = useCallback(() => {
    if (!fezData) {
      return;
    }
    alertCancel(fezData.fezType, () => {
      cancelMutation.mutate(
        {
          fezID: fezData.fezID,
        },
        {
          onSuccess: response => {
            setSnackbarPayload({message: 'Successfully canceled this event.', messageType: 'info'});
            cancelFez(fezData.fezID, response.data);
            dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
          },
        },
      );
    });
  }, [cancelFez, cancelMutation, dispatchScrollToTop, fezData, setSnackbarPayload]);

  const confirmDelete = useCallback(
    (handleNavigation = true) => {
      if (!fezData) {
        return;
      }
      alertDelete(() => {
        deleteMutation.mutate(
          {
            fezID: fezData.fezID,
          },
          {
            onSuccess: () => {
              if (handleNavigation) {
                navigation.goBack();
              }
              setSnackbarPayload({message: 'Successfully deleted this event.', messageType: 'info'});
              deleteFez(fezData.fezID);
            },
          },
        );
      });
    },
    [deleteFez, deleteMutation, fezData, navigation, setSnackbarPayload],
  );

  const confirmLeave = useCallback(() => {
    if (!fezData) {
      return;
    }
    alertLeave(fezData.title, fezData.fezType, () => {
      membershipMutation.mutate(
        {
          fezID: fezData.fezID,
          action: 'unjoin',
        },
        {
          onSuccess: response => {
            updateMembership(fezData.fezID, response.data, 'unjoin');
            if (FezType.isPrivateEventType(fezData.fezType)) {
              const state = navigation.getState();
              const routeIndex = state.routes.findIndex(
                route =>
                  route.name === CommonStackComponents.personalEventScreen &&
                  (route.params as {eventID?: string} | undefined)?.eventID === fezData.fezID,
              );
              if (routeIndex > 0) {
                navigation.pop(state.index - routeIndex + 1);
              } else {
                navigation.goBack();
              }
            } else {
              dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
            }
          },
        },
      );
    });
  }, [dispatchScrollToTop, fezData, membershipMutation, navigation, updateMembership]);

  return {confirmCancel, confirmDelete, confirmLeave};
};
