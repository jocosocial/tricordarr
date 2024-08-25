import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {HelpHeaderText} from '../../Text/HelpHeaderText.tsx';
import {Text} from 'react-native-paper';
import {SchedImportForm} from '../../Forms/SchedImportForm.tsx';
import {SchedImportFormValues} from '../../../libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {useEventsQuery} from '../../Queries/Events/EventQueries.tsx';
import {getCalFeedFromUrl, getEventUid} from '../../../libraries/Schedule.ts';
import {useEventFavoriteMutation} from '../../Queries/Events/EventFavoriteQueries.tsx';

export const ScheduleImportScreen = () => {
  const {appConfig} = useConfig();
  const {data: twitarrEvents, refetch} = useEventsQuery({});
  const eventFavoriteMutation = useEventFavoriteMutation();

  const onSubmit = async (values: SchedImportFormValues, helpers: FormikHelpers<SchedImportFormValues>) => {
    await refetch();
    if (!twitarrEvents) {
      console.error('Unable to get events from Twitarr?');
      helpers.setSubmitting(false);
      return;
    }
    const schedUrl = `${appConfig.schedBaseUrl}/${values.username}.ics`;
    // const response = await fetch(fullSchedUrl, {
    //   method: 'GET',
    //   headers: {
    //     'User-Agent':
    //       'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    //   },
    // });
    // const icsData = await response.text();
    const schedEvents = await getCalFeedFromUrl(schedUrl);

    for (const schedEvent of schedEvents) {
      const schedEventUid = getEventUid(schedEvent.uid);
      console.log(`Processing event ${schedEventUid} (${schedEvent.summary}).`);
      const twitarrEvent = twitarrEvents.find(e => e.uid === schedEventUid);
      if (!twitarrEvent) {
        console.warn(`No match for event ${schedEventUid} (${schedEvent.summary}).`);
        continue;
      }
      const twitarrEventID = twitarrEvent.eventID;
      eventFavoriteMutation.mutate({
        eventID: twitarrEventID,
        action: 'favorite',
      });
    }

    helpers.setSubmitting(false);
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          <Text>Import your Sched.com schedule favorites to Twitarr.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <HelpHeaderText>Prerequisites</HelpHeaderText>
        </PaddedContentView>
        <PaddedContentView>
          <Text>You must have already created a Sched.com account for JoCo Cruise this year.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Your personal schedule must be public, meaning others can see you in the attendee list. This only needs to
            be set during the import. You can return your profile to private when you're done.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            You do NOT need to have an internet package to do this! Sched.com is allowed on ship wifi without a paid
            internet package.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <SchedImportForm initialValues={{username: ''}} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
