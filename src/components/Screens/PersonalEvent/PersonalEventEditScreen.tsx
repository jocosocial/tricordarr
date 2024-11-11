import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {PersonalEventForm} from '../../Forms/PersonalEventForm.tsx';
import {PersonalEventFormValues} from '../../../libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {addMinutes, differenceInMinutes} from 'date-fns';
import {getEventTimezoneOffset, getScheduleItemStartEndTime} from '../../../libraries/DateTime.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {usePersonalEventUpdateMutation} from '../../Queries/PersonalEvent/PersonalEventMutations.tsx';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventEditScreen>;
export const PersonalEventEditScreen = ({navigation, route}: Props) => {
  const {appConfig} = useConfig();
  const updateMutation = usePersonalEventUpdateMutation();
  const queryClient = useQueryClient();

  const onSubmit = (values: PersonalEventFormValues, helpers: FormikHelpers<PersonalEventFormValues>) => {
    let {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);

    updateMutation.mutate(
      {
        personalEventID: route.params.personalEvent.personalEventID,
        personalEventContentData: {
          title: values.title,
          description: values.description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: values.location,
          participants: values.participants.map(p => p.userID),
        },
      },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries([`/personalevents/${route.params.personalEvent.personalEventID}`]),
            queryClient.invalidateQueries(['/personalevents']),
          ]);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const offset = getEventTimezoneOffset(
    appConfig.portTimeZoneID,
    route.params.personalEvent.startTime,
    route.params.personalEvent.timeZoneID,
  );
  let startDate = new Date(route.params.personalEvent.startTime);
  startDate = addMinutes(startDate, offset);
  let endDate = new Date(route.params.personalEvent.endTime);
  endDate = addMinutes(endDate, offset);

  const initialValues: PersonalEventFormValues = {
    startDate: startDate,
    duration: differenceInMinutes(endDate, startDate).toString(),
    startTime: {
      hours: startDate.getHours(),
      minutes: startDate.getMinutes(),
    },
    title: route.params.personalEvent.title,
    location: route.params.personalEvent.location,
    description: route.params.personalEvent.description,
    participants: route.params.personalEvent.participants,
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <PersonalEventForm initialValues={initialValues} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
