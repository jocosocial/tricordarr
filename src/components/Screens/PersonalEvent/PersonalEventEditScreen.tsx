import React, {useEffect} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {PersonalEventForm} from '../../Forms/PersonalEventForm.tsx';
import {FezFormValues} from '../../../libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {addMinutes, differenceInMinutes} from 'date-fns';
import {getEventTimezoneOffset, getScheduleItemStartEndTime} from '../../../libraries/DateTime.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {useQueryClient} from '@tanstack/react-query';
import {FezType} from '../../../libraries/Enums/FezType.ts';
import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useFezUpdateMutation} from '../../Queries/Fez/FezMutations.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventEditScreen>;
export const PersonalEventEditScreen = ({navigation, route}: Props) => {
  const {appConfig} = useConfig();
  const updateMutation = useFezUpdateMutation();
  const queryClient = useQueryClient();

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    let {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);

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
          const invalidations = FezData.getCacheKeys(route.params.personalEvent.fezID).map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all([...invalidations, queryClient.invalidateQueries(['/notification/global'])]);
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
  let startDate = new Date(route.params.personalEvent.startTime || new Date());
  startDate = addMinutes(startDate, offset);
  let endDate = new Date(route.params.personalEvent.endTime || new Date());
  endDate = addMinutes(endDate, offset);

  const initialValues: FezFormValues = {
    title: route.params.personalEvent.title,
    location: route.params.personalEvent.location,
    fezType: route.params.personalEvent.fezType,
    startDate: startDate,
    duration: differenceInMinutes(endDate, startDate).toString(),
    minCapacity: route.params.personalEvent.minParticipants.toString(),
    maxCapacity: route.params.personalEvent.maxParticipants.toString(),
    info: route.params.personalEvent.info,
    startTime: {
      hours: startDate.getHours(),
      minutes: startDate.getMinutes(),
    },
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
        <PaddedContentView padTop={true}>
          <PersonalEventForm initialValues={initialValues} onSubmit={onSubmit} create={false} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
