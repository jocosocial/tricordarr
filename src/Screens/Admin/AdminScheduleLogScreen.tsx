import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useScheduleLogEntryQuery} from '#src/Queries/Admin/ScheduleQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {EventData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminScheduleLogScreen>;

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

export const AdminScheduleLogScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminScheduleLogScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminScheduleLogScreenInner = ({route}: Props) => {
  const {data, refetch, isLoading} = useScheduleLogEntryQuery({logID: route.params.logID});
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useAdminHelpButton();

  if (isLoading && !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <EventChangeList title={'Created'} events={data?.createdEvents ?? []} />
        <EventChangeList title={'Deleted'} events={data?.deletedEvents ?? []} />
        <EventChangeList title={'Time Changes'} events={data?.timeChangeEvents ?? []} />
        <EventChangeList title={'Location Changes'} events={data?.locationChangeEvents ?? []} />
        <EventChangeList title={'Minor Changes'} events={data?.minorChangeEvents ?? []} />
      </ScrollingContentView>
    </AppView>
  );
};
