import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {addMinutes, differenceInMinutes} from 'date-fns';
import {FormikHelpers} from 'formik';
import React from 'react';

import {LfgForm} from '#src/Components/Forms/LfgForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LfgCanceledView} from '#src/Components/Views/Static/LfgCanceledView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {getEventTimezoneOffset, getScheduleItemStartEndTime} from '#src/Libraries/DateTime';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezUpdateMutation} from '#src/Queries/Fez/FezMutations';
import {FezData} from '#src/Structs/ControllerStructs';
import {FezFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgEditScreen>;
export const LfgEditScreen = ({route, navigation}: Props) => {
  const updateMutation = useFezUpdateMutation();
  const {appConfig} = useConfig();
  const offset = getEventTimezoneOffset(
    appConfig.portTimeZoneID,
    route.params.fez.startTime,
    route.params.fez.timeZoneID,
  );
  const queryClient = useQueryClient();

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    let {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);

    updateMutation.mutate(
      {
        fezID: route.params.fez.fezID,
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
        onSuccess: async () => {
          navigation.goBack();
          const invalidations = FezData.getCacheKeys(route.params.fez.fezID).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all([...invalidations, queryClient.invalidateQueries({queryKey: ['/notification/global']})]);
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  let startDate = new Date(route.params.fez.startTime || new Date());
  startDate = addMinutes(startDate, offset);
  let endDate = new Date(route.params.fez.endTime || new Date());
  endDate = addMinutes(endDate, offset);

  const initialValues: FezFormValues = {
    title: route.params.fez.title,
    location: route.params.fez.location || '',
    fezType: route.params.fez.fezType,
    startDate: startDate,
    duration: differenceInMinutes(endDate, startDate).toString(),
    minCapacity: route.params.fez.minParticipants.toString(),
    maxCapacity: route.params.fez.maxParticipants.toString(),
    info: route.params.fez.info,
    startTime: {
      hours: startDate.getHours(),
      minutes: startDate.getMinutes(),
    },
    initialUsers: [],
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        {route.params.fez.cancelled && <LfgCanceledView update={true} />}
        <PaddedContentView padTop={true}>
          <LfgForm onSubmit={onSubmit} initialValues={initialValues} buttonText={'Save'} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
