import {AppView} from '../../Views/AppView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {PersonalEventForm} from '../../Forms/PersonalEventForm.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import React from 'react';
import {FezFormValues} from '../../../libraries/Types/FormValues.ts';
import {usePersonalEventCreateMutation} from '../../Queries/PersonalEvent/PersonalEventMutations.ts';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import {getApparentCruiseDate, getScheduleItemStartEndTime} from '../../../libraries/DateTime.ts';
import {FezType} from '../../../libraries/Enums/FezType.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventCreateScreen>;
export const PersonalEventCreateScreen = ({navigation, route}: Props) => {
  const createMutation = usePersonalEventCreateMutation();
  const queryClient = useQueryClient();
  const {startDate, adjustedCruiseDayToday} = useCruise();

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    let {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);

    createMutation.mutate(
      {
        personalEventContentData: {
          title: values.title,
          info: values.info,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: values.location,
          minCapacity: 0,
          maxCapacity: 0,
          initialUsers: values.initialUsers.map(u => u.userID),
          fezType: values.initialUsers.length > 0 ? FezType.privateEvent : FezType.privateEvent,
        },
      },
      {
        onSuccess: async () => {
          // @TODO the thingy
          await queryClient.invalidateQueries(['/fez/owner']);
          await queryClient.invalidateQueries(['/fez/joined']);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };
  const initialValues: FezFormValues = {
    title: '',
    startDate: getApparentCruiseDate(
      startDate,
      route.params.cruiseDay !== undefined ? route.params.cruiseDay : adjustedCruiseDayToday,
    ),
    duration: '30',
    info: '',
    startTime: {
      hours: new Date().getHours() + 1,
      minutes: 0,
    },
    fezType: FezType.personalEvent,
    minCapacity: '0',
    maxCapacity: '0',
    initialUsers: [],
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
