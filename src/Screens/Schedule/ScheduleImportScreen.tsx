import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import {VEvent} from 'node-ical';
import pluralize from 'pluralize';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Linking, View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {SchedImportForm} from '#src/Components/Forms/SchedImportForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {createLogger} from '#src/Libraries/Logger';
import {getCalFeedFromUrl, getEventUid} from '#src/Libraries/Schedule';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useEventFavoriteMutation} from '#src/Queries/Events/EventFavoriteMutations';
import {useEventsQuery} from '#src/Queries/Events/EventQueries';
import {EventData, UserNotificationData} from '#src/Structs/ControllerStructs';
import {SchedImportFormValues} from '#src/Types/FormValues';

const logger = createLogger('ScheduleImportScreen.tsx');

export const ScheduleImportScreen = () => {
  const navigation = useCommonStack();
  const {appConfig, updateAppConfig} = useConfig();
  const {data: twitarrEvents, refetch} = useEventsQuery({});
  const eventFavoriteMutation = useEventFavoriteMutation();
  const [log, setLog] = useState<string[]>([]);
  const {setSnackbarPayload} = useSnackbar();
  const queryClient = useQueryClient();

  const writeLog = (line: string) => setLog(prevLogs => [...prevLogs, line]);

  const initialValues = useMemo<SchedImportFormValues>(
    () => ({username: '', schedUrl: appConfig.schedBaseUrl}),
    [appConfig.schedBaseUrl],
  );

  const handleOpenInBrowser = useCallback(() => {
    Linking.openURL(appConfig.schedBaseUrl).catch(error => {
      logger.error('Failed to open Sched URL in browser.', error);
      setSnackbarPayload({message: 'Unable to open Sched in your browser.', messageType: 'error'});
    });
  }, [appConfig.schedBaseUrl, setSnackbarPayload]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item title={'Open in Browser'} iconName={AppIcons.webview} onPress={handleOpenInBrowser} />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.scheduleImportHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [handleOpenInBrowser, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const onSubmit = async (values: SchedImportFormValues, helpers: FormikHelpers<SchedImportFormValues>) => {
    setLog([]);
    updateAppConfig({
      ...appConfig,
      schedBaseUrl: values.schedUrl,
    });
    const invalidations = EventData.getCacheKeys()
      .concat(UserNotificationData.getCacheKeys())
      .map(key => queryClient.invalidateQueries({queryKey: key}));
    await Promise.all(invalidations);
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
      const schedUrl = `${values.schedUrl}/${values.username}.ics`;
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
    await queryClient.invalidateQueries({queryKey: ['/events']});
    helpers.setSubmitting(false);
  };

  return (
    <AppView>
      <ScrollingContentView overScroll={true}>
        <PaddedContentView>
          <SchedImportForm initialValues={initialValues} onSubmit={onSubmit} />
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
