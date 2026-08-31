import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React from 'react';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AdminAnnouncementForm} from '#src/Components/Forms/Admin/AdminAnnouncementForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {combineDateAndTime, splitIsoDateTime} from '#src/Libraries/Admin/AdminDateTime';
import {alertDeleteAnnouncement} from '#src/Libraries/Alerts/AdminAlerts';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useEditAnnouncementMutation,
} from '#src/Queries/Admin/AnnouncementMutations';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {AdminAnnouncementFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminAnnouncementEditScreen>;

export const AdminAnnouncementEditScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminAnnouncementEditScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminAnnouncementEditScreenInner = ({route, navigation}: Props) => {
  const announcement = route.params.announcement;
  const createMutation = useCreateAnnouncementMutation();
  const editMutation = useEditAnnouncementMutation();
  const deleteMutation = useDeleteAnnouncementMutation();
  const {setSnackbarPayload} = useSnackbar();
  useAdminHelpButton();

  const existing = announcement ? splitIsoDateTime(announcement.displayUntil) : undefined;
  const initialValues: AdminAnnouncementFormValues = {
    text: announcement?.text ?? '',
    displayUntilDate: existing?.date ?? new Date(),
    displayUntilTime: existing?.time ?? {hours: 23, minutes: 59},
  };

  const onSubmit = (values: AdminAnnouncementFormValues, helpers: FormikHelpers<AdminAnnouncementFormValues>) => {
    const data = {
      text: values.text,
      displayUntil: combineDateAndTime(values.displayUntilDate, values.displayUntilTime),
    };
    if (announcement) {
      editMutation.mutate(
        {announcementID: announcement.id, data},
        {
          onSuccess: () => {
            setSnackbarPayload({message: 'Announcement updated.', messageType: 'success'});
            navigation.goBack();
          },
          onSettled: () => helpers.setSubmitting(false),
        },
      );
      return;
    }
    createMutation.mutate(data, {
      onSuccess: () => {
        setSnackbarPayload({message: 'Announcement created.', messageType: 'success'});
        navigation.goBack();
      },
      onSettled: () => helpers.setSubmitting(false),
    });
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <AdminAnnouncementForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            buttonText={announcement ? 'Save' : 'Create'}
          />
        </PaddedContentView>
        {announcement && (
          <PaddedContentView>
            <PrimaryActionButton
              testID={'announcementDelete-button'}
              buttonText={'Delete'}
              onPress={() =>
                alertDeleteAnnouncement(() =>
                  deleteMutation.mutate(announcement.id, {
                    onSuccess: () => {
                      setSnackbarPayload({message: 'Announcement deleted.', messageType: 'success'});
                      navigation.goBack();
                    },
                  }),
                )
              }
              isLoading={deleteMutation.isPending}
            />
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
