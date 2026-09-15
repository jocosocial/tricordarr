import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {AnnouncementCreateData} from '#src/Structs/AdminControllerStructs';
import {AnnouncementData, UserNotificationData} from '#src/Structs/ControllerStructs';

export const useCreateAnnouncementMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (data: AnnouncementCreateData) => {
    return await apiPost('/notification/announcement/create', data);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      AnnouncementData.getCacheKeys()
        .concat(UserNotificationData.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

interface EditAnnouncementProps {
  announcementID: number;
  data: AnnouncementCreateData;
}

export const useEditAnnouncementMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({announcementID, data}: EditAnnouncementProps) => {
    return await apiPost<AnnouncementData, AnnouncementCreateData>(
      `/notification/announcement/${announcementID}/edit`,
      data,
    );
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      AnnouncementData.getCacheKeys()
        .concat(UserNotificationData.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export const useDeleteAnnouncementMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (announcementID: number) => {
    try {
      return await apiDelete(`/notification/announcement/${announcementID}`);
    } catch {
      return await apiPost(`/notification/announcement/${announcementID}/delete`);
    }
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      AnnouncementData.getCacheKeys()
        .concat(UserNotificationData.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
