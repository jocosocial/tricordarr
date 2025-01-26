import React, {useState} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {Text} from 'react-native-paper';
import {SchedImportForm} from '../../Forms/SchedImportForm.tsx';
import {SchedImportFormValues} from '../../../libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {useEventsQuery} from '../../Queries/Events/EventQueries.ts';
import {getCalFeedFromUrl, getEventUid} from '../../../libraries/Schedule.ts';
import {useEventFavoriteMutation} from '../../Queries/Events/EventFavoriteMutations.ts';
import pluralize from 'pluralize';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext.ts';
import {VEvent} from 'node-ical';
import {HelpTopicView} from '../../Views/Help/HelpTopicView.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from '../../Context/Contexts/SnackbarContext.ts';

export const ScheduleImportScreen = () => {
  const {appConfig} = useConfig();
  const {data: twitarrEvents, refetch} = useEventsQuery({});
  const eventFavoriteMutation = useEventFavoriteMutation();
  const [log, setLog] = useState<string[]>([]);
  const {setSnackbarPayload} = useSnackbar();
  const queryClient = useQueryClient();

  const writeLog = (line: string) => setLog(prevLogs => [...prevLogs, line]);

  const onSubmit = async (values: SchedImportFormValues, helpers: FormikHelpers<SchedImportFormValues>) => {
    setLog([]);
    await queryClient.invalidateQueries(['/events']);
    let successCount = 0,
      skipCount = 0;
    await refetch();
    if (!twitarrEvents) {
      console.error('Unable to get events from Twitarr?');
      helpers.setSubmitting(false);
      return;
    }
    let schedEvents: VEvent[] = [];
    try {
      const schedUrl = `${appConfig.schedBaseUrl}/${values.username}.ics`;
      schedEvents = await getCalFeedFromUrl(schedUrl);
    } catch (error) {
      setSnackbarPayload({message: String(error), messageType: 'error'});
      helpers.setSubmitting(false);
      return;
    }

    const mutations = [];

    for (const schedEvent of schedEvents) {
      const schedEventUid = getEventUid(schedEvent.uid);
      const twitarrEvent = twitarrEvents.find(e => e.uid === schedEventUid);
      if (!twitarrEvent) {
        writeLog(`No match for event "${schedEvent.summary}" with UID ${schedEventUid}. Please favorite it manually.`);
        continue;
      }
      if (twitarrEvent.isFavorite) {
        skipCount += 1;
        continue;
      }
      mutations.push(
        eventFavoriteMutation.mutateAsync({
          eventID: twitarrEvent.eventID,
          action: 'favorite',
        }),
      );
    }
    await Promise.allSettled(mutations);
    successCount = mutations.length;
    writeLog('');
    if (successCount === 0 && skipCount === 0) {
      writeLog('Found no events to import. Check username and prerequisites above.');
    } else {
      writeLog(`Successfully processed ${successCount} ${pluralize('event', successCount)}.`);
      writeLog(`Skipped ${skipCount} ${pluralize('event', skipCount)} already favorited.`);
    }
    await queryClient.invalidateQueries(['/events']);
    helpers.setSubmitting(false);
  };

  return (
    <AppView>
      <ScrollingContentView overScroll={true}>
        <HelpTopicView>Import your Sched.com schedule favorites to Twitarr.</HelpTopicView>
        <HelpTopicView title={'Prerequisites'}>
          You must have already created a Sched.com account for JoCo Cruise this year.
        </HelpTopicView>
        <HelpTopicView>
          Your personal schedule must be public, meaning others can see you in the attendee list. This only needs to be
          set during the import. You can return your profile to private when you're done.
        </HelpTopicView>
        <HelpTopicView>
          You do NOT need to have an internet package to do this! Sched.com is allowed on ship wifi without a paid
          internet package.
        </HelpTopicView>
        <PaddedContentView>
          <SchedImportForm initialValues={{username: ''}} onSubmit={onSubmit} />
        </PaddedContentView>
        <PaddedContentView>
          {log.map((line, index) => (
            <Text key={index} selectable={true} variant={'bodySmall'}>
              {line}
            </Text>
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
