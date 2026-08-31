import {StackScreenProps} from '@react-navigation/stack';
import {Formik} from 'formik';
import React, {useState} from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useScheduleReloadMutation, useScheduleUploadMutation} from '#src/Queries/Admin/ScheduleMutations';
import {useScheduleLogQuery} from '#src/Queries/Admin/ScheduleQueries';
import {useReloadNotificationsMutation} from '#src/Queries/Admin/SeedMutations';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminScheduleScreen>;

interface UploadForm {
  schedule: string;
}

export const AdminScheduleScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminScheduleScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminScheduleScreenInner = ({navigation}: Props) => {
  const {data: logs, refetch, isLoading} = useScheduleLogQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const uploadMutation = useScheduleUploadMutation();
  const reloadMutation = useScheduleReloadMutation();
  const notifyMutation = useReloadNotificationsMutation();
  const {canReloadNotifications} = useAdminAccess();
  const {setSnackbarPayload} = useSnackbar();
  const [uploaded, setUploaded] = useState(false);
  useAdminHelpButton();

  const onUpload = (values: UploadForm) => {
    uploadMutation.mutate(
      {schedule: values.schedule},
      {
        onSuccess: () => {
          setUploaded(true);
          setSnackbarPayload({message: 'Schedule uploaded. Verify the changes next.', messageType: 'success'});
        },
      },
    );
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Text>
            Paste the full contents of an ICS schedule file. Upload stores it on the server. Verify shows the diff.
            Apply commits it.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Formik initialValues={{schedule: ''}} onSubmit={onUpload}>
            {({handleSubmit, isSubmitting}) => (
              <>
                <TextField
                  name={'schedule'}
                  testID={'ics-field'}
                  label={'ICS File Contents'}
                  multiline={true}
                  numberOfLines={8}
                />
                <PrimaryActionButton
                  testID={'scheduleUpload-button'}
                  buttonText={'Upload'}
                  onPress={handleSubmit}
                  disabled={isSubmitting || uploadMutation.isPending}
                  isLoading={uploadMutation.isPending}
                />
              </>
            )}
          </Formik>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'scheduleVerify-button'}
            buttonText={'Verify Uploaded Schedule'}
            onPress={() => navigation.push(CommonStackComponents.adminScheduleVerifyScreen)}
            disabled={!uploaded && !logs?.length}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'scheduleReload-button'}
            buttonText={'Reload Schedule From URL'}
            onPress={() =>
              reloadMutation.mutate(undefined, {
                onSuccess: () => {
                  setSnackbarPayload({message: 'Schedule reload started.', messageType: 'success'});
                  refetch();
                },
              })
            }
            isLoading={reloadMutation.isPending}
          />
        </PaddedContentView>
        {canReloadNotifications && (
          <PaddedContentView>
            <PrimaryActionButton
              testID={'notifyReload-button'}
              buttonText={'Rebuild Notification Caches'}
              onPress={() =>
                notifyMutation.mutate(undefined, {
                  onSuccess: () => {
                    setSnackbarPayload({message: 'Notification rebuild started.', messageType: 'success'});
                  },
                })
              }
              isLoading={notifyMutation.isPending}
            />
          </PaddedContentView>
        )}
        <ListSection>
          <ListSubheader>Update Log</ListSubheader>
        </ListSection>
        {!isLoading &&
          logs?.map(entry => (
            <DataFieldListItem
              key={entry.entryID}
              title={`${entry.automaticUpdate ? 'Automatic' : 'Manual'} · ${entry.changeCount} changes`}
              description={
                entry.error
                  ? `${new Date(entry.timestamp).toLocaleString()} · ${entry.error}`
                  : new Date(entry.timestamp).toLocaleString()
              }
              onPress={() => navigation.push(CommonStackComponents.adminScheduleLogScreen, {logID: entry.entryID})}
            />
          ))}
      </ScrollingContentView>
    </AppView>
  );
};
