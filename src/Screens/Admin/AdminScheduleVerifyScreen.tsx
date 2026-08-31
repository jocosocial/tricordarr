import {Formik} from 'formik';
import React from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertApplySchedule} from '#src/Libraries/Alerts/AdminAlerts';
import {useScheduleApplyMutation} from '#src/Queries/Admin/ScheduleMutations';
import {useScheduleVerifyQuery} from '#src/Queries/Admin/ScheduleQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {EventData} from '#src/Structs/ControllerStructs';
import {AdminScheduleApplyFormValues} from '#src/Types/FormValues';

const EventChangeList = ({title, events}: {title: string; events: EventData[]}) => {
  if (!events.length) {
    return null;
  }
  return (
    <>
      <ListSection>
        <ListSubheader>{`${title} (${events.length})`}</ListSubheader>
      </ListSection>
      {events.map(event => (
        <DataFieldListItem
          key={event.eventID}
          title={event.title}
          description={`${event.location} · ${new Date(event.startTime).toLocaleString()}`}
        />
      ))}
    </>
  );
};

export const AdminScheduleVerifyScreen = () => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminScheduleVerifyScreenInner />
    </AdminAccessScreen>
  );
};

const AdminScheduleVerifyScreenInner = () => {
  const {data, refetch, isLoading} = useScheduleVerifyQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const applyMutation = useScheduleApplyMutation();
  const {setSnackbarPayload} = useSnackbar();
  useAdminHelpButton();

  const onApply = (values: AdminScheduleApplyFormValues) => {
    alertApplySchedule(() =>
      applyMutation.mutate(
        {forumPosts: values.addForumPosts, processDeletes: values.processDeletes},
        {
          onSuccess: () => {
            setSnackbarPayload({message: 'Schedule update applied.', messageType: 'success'});
          },
        },
      ),
    );
  };

  if (isLoading && !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {!data && (
          <PaddedContentView padTop={true}>
            <Text>No uploaded schedule to verify. Upload an ICS file first.</Text>
          </PaddedContentView>
        )}
        {data && (
          <>
            <EventChangeList title={'Created'} events={data.createdEvents} />
            <EventChangeList title={'Deleted'} events={data.deletedEvents} />
            <EventChangeList title={'Time Changes'} events={data.timeChangeEvents} />
            <EventChangeList title={'Location Changes'} events={data.locationChangeEvents} />
            <EventChangeList title={'Minor Changes'} events={data.minorChangeEvents} />
            <PaddedContentView padTop={true}>
              <Formik initialValues={{addForumPosts: true, processDeletes: false}} onSubmit={onApply}>
                {({handleSubmit}) => (
                  <>
                    <BooleanField
                      name={'addForumPosts'}
                      testID={'forumPosts-switch'}
                      label={'Post schedule changes in event forum threads'}
                    />
                    <BooleanField
                      name={'processDeletes'}
                      testID={'processDeletes-switch'}
                      label={'Process Deletes'}
                      helperText={'Treat the uploaded file as the complete schedule. Leave off for a partial update.'}
                    />
                    <PrimaryActionButton
                      testID={'scheduleApply-button'}
                      buttonText={'Apply Update'}
                      onPress={handleSubmit}
                      isLoading={applyMutation.isPending}
                    />
                  </>
                )}
              </Formik>
            </PaddedContentView>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
