import {AppView} from '../../Views/AppView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {PersonalEventForm} from '../../Forms/PersonalEventForm.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import React from 'react';
import {PersonalEventFormValues} from '../../../libraries/Types/FormValues.ts';
import {usePersonalEventCreateMutation} from '../../Queries/PersonalEvent/PersonalEventMutations.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import {addMinutes} from 'date-fns';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {getApparentCruiseDate} from '../../../libraries/DateTime.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventCreateScreen>;
export const PersonalEventCreateScreen = ({navigation}: Props) => {
  const createMutation = usePersonalEventCreateMutation();
  const queryClient = useQueryClient();
  const {startDate, adjustedCruiseDayToday} = useCruise();

  const onSubmit = (values: PersonalEventFormValues, helpers: FormikHelpers<PersonalEventFormValues>) => {
    let eventStartTime = new Date(values.startDate);
    eventStartTime.setHours(values.startTime.hours);
    eventStartTime.setMinutes(values.startTime.minutes);

    let eventEndTime = addMinutes(eventStartTime, Number(values.duration));

    createMutation.mutate(
      {
        personalEventContentData: {
          title: values.title,
          description: values.description,
          startTime: eventStartTime.toISOString(),
          endTime: eventEndTime.toISOString(),
          location: values.location,
          participants: values.participants.map(p => p.userID),
        },
      },
      {
        onSuccess: async response => {
          await queryClient.invalidateQueries(['/personalevents']);
          navigation.replace(CommonStackComponents.personalEventScreen, {
            eventID: response.data.personalEventID,
          });
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };
  const initialValues: PersonalEventFormValues = {
    title: '',
    startDate: getApparentCruiseDate(startDate, adjustedCruiseDayToday),
    duration: '30',
    description: undefined,
    startTime: {
      hours: new Date().getHours() + 1,
      minutes: 0,
    },
    participants: [],
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
