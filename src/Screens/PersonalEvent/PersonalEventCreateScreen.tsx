import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {PersonalEventForm} from '#src/Components/Forms/PersonalEventForm';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import React from 'react';
import {FezFormValues} from '#src/Types/FormValues';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {getApparentCruiseDate, getScheduleItemStartEndTime} from '#src/Libraries/DateTime';
import {FezType} from '#src/Enums/FezType';
import {FezData} from '#src/Structs/ControllerStructs';
import {useFezCreateMutation} from '#src/Queries/Fez/FezMutations';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventCreateScreen>;
export const PersonalEventCreateScreen = ({navigation, route}: Props) => {
  const createMutation = useFezCreateMutation();
  const queryClient = useQueryClient();
  const {startDate, adjustedCruiseDayToday} = useCruise();

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    let {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);

    createMutation.mutate(
      {
        fezContentData: {
          title: values.title,
          info: values.info,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: values.location,
          minCapacity: 0,
          maxCapacity: 0,
          initialUsers: values.initialUsers.map(u => u.userID),
          fezType: values.initialUsers.length > 0 ? FezType.privateEvent : FezType.personalEvent,
        },
      },
      {
        onSuccess: async () => {
          const invalidations = FezData.getCacheKeys().map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all(invalidations);
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
    location: '',
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
