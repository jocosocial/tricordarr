import React from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {LfgForm} from '#src/Forms/LfgForm.tsx';
import {FezFormValues} from '../../../Libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {FezType} from '../../../Libraries/Enums/FezType.ts';
import {useCruise} from '#src/Context/Contexts/CruiseContext.ts';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens.tsx';
import {getApparentCruiseDate, getScheduleItemStartEndTime} from '../../../Libraries/DateTime.ts';
import {useFezCreateMutation} from '#src/Queries/Fez/FezMutations.ts';
import {useQueryClient} from '@tanstack/react-query';

interface LfgCreateScreenBaseProps {
  title?: string;
  info?: string;
  location?: string;
  fezType?: FezType;
  duration?: number;
  minCapacity?: number;
  maxCapacity?: number;
}
export const LfgCreateScreenBase = ({
  title = '',
  info = '',
  location = '',
  fezType = FezType.activity,
  duration = 30,
  minCapacity = 2,
  maxCapacity = 2,
}: LfgCreateScreenBaseProps) => {
  const navigation = useCommonStack();
  const fezMutation = useFezCreateMutation();
  const {startDate, adjustedCruiseDayToday} = useCruise();
  const queryClient = useQueryClient();

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    helpers.setSubmitting(true);
    let {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);

    fezMutation.mutate(
      {
        fezContentData: {
          fezType: values.fezType,
          title: values.title,
          info: values.info,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: values.location,
          minCapacity: Number(values.minCapacity),
          maxCapacity: Number(values.maxCapacity),
          initialUsers: [],
        },
      },
      {
        onSuccess: async response => {
          navigation.replace(CommonStackComponents.lfgScreen, {
            fezID: response.data.fezID,
          });
          await queryClient.invalidateQueries(['/notification/global']);
        },
        onSettled: () => {
          helpers.setSubmitting(false);
        },
      },
    );
  };

  // @TODO make this form (and the form components) more generic to take types
  const initialValues: FezFormValues = {
    title: title,
    location: location,
    fezType: fezType,
    startDate: getApparentCruiseDate(startDate, adjustedCruiseDayToday),
    duration: String(duration),
    minCapacity: String(minCapacity),
    maxCapacity: String(maxCapacity),
    info: info,
    startTime: {
      hours: new Date().getHours() + 1,
      minutes: 0,
    },
    initialUsers: [],
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <LfgForm onSubmit={onSubmit} initialValues={initialValues} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
