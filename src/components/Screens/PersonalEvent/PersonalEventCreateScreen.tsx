import {AppView} from '../../Views/AppView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {PersonalEventForm} from '../../Forms/PersonalEventForm.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import React from 'react';
import {PersonalEventFormValues} from '../../../libraries/Types/FormValues.ts';
import {usePersonalEventCreateMutation} from '../../Queries/PersonalEvent/PersonalEventMutations.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {getApparentCruiseDate, getScheduleItemStartEndTime} from '../../../libraries/DateTime.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventCreateScreen>;
export const PersonalEventCreateScreen = ({navigation, route}: Props) => {
  const createMutation = usePersonalEventCreateMutation();
  const queryClient = useQueryClient();
  const {startDate, adjustedCruiseDayToday} = useCruise();

  const onSubmit = (values: PersonalEventFormValues, helpers: FormikHelpers<PersonalEventFormValues>) => {
    let {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);

    createMutation.mutate(
      {
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
          await queryClient.invalidateQueries(['/personalevents']);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };
  const initialValues: PersonalEventFormValues = {
    title: '',
    startDate: getApparentCruiseDate(
      startDate,
      route.params.cruiseDay !== undefined ? route.params.cruiseDay : adjustedCruiseDayToday,
    ),
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
