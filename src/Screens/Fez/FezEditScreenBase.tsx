import {useQueryClient} from '@tanstack/react-query';
import {differenceInMinutes} from 'date-fns';
import {FormikHelpers} from 'formik';
import React, {useEffect} from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {FezCanceledView} from '#src/Components/Views/Static/FezCanceledView';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {getScheduleItemStartEndTime, getTimePartsInTz} from '#src/Libraries/DateTime';
import {useCommonStack} from '#src/Navigation/CommonScreens';
import {useFezUpdateMutation} from '#src/Queries/Fez/FezMutations';
import {FezData, UserNotificationData} from '#src/Structs/ControllerStructs';
import {FezFormValues} from '#src/Types/FormValues';

export interface FezEditScreenBaseFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void;
  initialValues: FezFormValues;
}

interface FezEditScreenBaseProps {
  fez: FezData;
  renderForm: (props: FezEditScreenBaseFormProps) => React.ReactNode;
  screenTitle?: string;
}

export const FezEditScreenBase = ({fez, renderForm, screenTitle}: FezEditScreenBaseProps) => {
  const navigation = useCommonStack();
  const updateMutation = useFezUpdateMutation();
  const queryClient = useQueryClient();
  const {tzAtTime} = useTimeZone();

  useEffect(() => {
    if (screenTitle !== undefined) {
      navigation.setOptions({title: screenTitle});
    }
  }, [navigation, screenTitle]);

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    const {startTime, endTime} = getScheduleItemStartEndTime(
      values.startDate,
      values.startTime,
      values.duration,
      tzAtTime(values.startDate),
    );

    updateMutation.mutate(
      {
        fezID: fez.fezID,
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
            .concat(FezData.getCacheKeys(fez.fezID))
            .map(key => queryClient.invalidateQueries({queryKey: key}));
          await Promise.all(invalidations);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const startDate = new Date(fez.startTime || new Date());
  const endDate = new Date(fez.endTime || new Date());
  const durationMinutes = differenceInMinutes(endDate, startDate);

  const initialValues: FezFormValues = {
    title: fez.title,
    location: fez.location,
    fezType: fez.fezType,
    startDate: startDate,
    duration: durationMinutes.toString(),
    minCapacity: fez.minParticipants.toString(),
    maxCapacity: fez.maxParticipants.toString(),
    info: fez.info,
    startTime: getTimePartsInTz(startDate, tzAtTime(startDate)),
    initialUsers: [],
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        {fez.cancelled && <FezCanceledView update={true} fezType={fez.fezType} />}
        <PaddedContentView padTop={true}>{renderForm({onSubmit, initialValues})}</PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
