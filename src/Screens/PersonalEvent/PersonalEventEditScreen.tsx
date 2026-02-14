import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {differenceInMinutes} from 'date-fns';
import {FormikHelpers} from 'formik';
import React, {useEffect} from 'react';

import {PersonalEventForm} from '#src/Components/Forms/PersonalEventForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {FezCanceledView} from '#src/Components/Views/Static/FezCanceledView';
import {FezType} from '#src/Enums/FezType';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {getScheduleItemStartEndTime, getTimePartsInTz} from '#src/Libraries/DateTime';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezUpdateMutation} from '#src/Queries/Fez/FezMutations';
import {FezData, UserNotificationData} from '#src/Structs/ControllerStructs';
import {FezFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.personalEventEditScreen>;
export const PersonalEventEditScreen = ({navigation, route}: Props) => {
  const updateMutation = useFezUpdateMutation();
  const queryClient = useQueryClient();
  const {tzAtTime} = useTimeZone();

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    let {startTime, endTime} = getScheduleItemStartEndTime(
      values.startDate,
      values.startTime,
      values.duration,
      tzAtTime(values.startDate),
    );

    updateMutation.mutate(
      {
        fezID: route.params.personalEvent.fezID,
        fezContentData: {
          title: values.title,
          info: values.info,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: values.location,
          fezType: values.fezType,
          minCapacity: Number(values.minCapacity),
          maxCapacity: Number(values.maxCapacity),
          initialUsers: [],
        },
      },
      {
        onSuccess: async () => {
          const invalidations = UserNotificationData.getCacheKeys()
            .concat(FezData.getCacheKeys(route.params.personalEvent.fezID))
            .map(key => queryClient.invalidateQueries({queryKey: key}));
          await Promise.all(invalidations);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  let startDate = new Date(route.params.personalEvent.startTime || new Date());
  let endDate = new Date(route.params.personalEvent.endTime || new Date());
  const durationMinutes = differenceInMinutes(endDate, startDate);

  const initialValues: FezFormValues = {
    title: route.params.personalEvent.title,
    location: route.params.personalEvent.location,
    fezType: route.params.personalEvent.fezType,
    startDate: startDate,
    duration: durationMinutes.toString(),
    minCapacity: route.params.personalEvent.minParticipants.toString(),
    maxCapacity: route.params.personalEvent.maxParticipants.toString(),
    info: route.params.personalEvent.info,
    startTime: getTimePartsInTz(startDate, tzAtTime(startDate)),
    initialUsers: [],
  };

  useEffect(() => {
    navigation.setOptions({
      title: route.params.personalEvent.fezType === FezType.privateEvent ? 'Edit Private Event' : 'Edit Personal Event',
    });
  }, [navigation, route.params.personalEvent.fezType]);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        {route.params.personalEvent.cancelled && (
          <FezCanceledView update={true} fezType={route.params.personalEvent.fezType} />
        )}
        <PaddedContentView padTop={true}>
          <PersonalEventForm initialValues={initialValues} onSubmit={onSubmit} create={false} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
