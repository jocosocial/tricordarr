import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {differenceInMinutes} from 'date-fns';
import {FormikHelpers} from 'formik';
import React from 'react';

import {LfgForm} from '#src/Components/Forms/LfgForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {FezCanceledView} from '#src/Components/Views/Static/FezCanceledView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {getScheduleItemStartEndTime, getTimePartsInTz} from '#src/Libraries/DateTime';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezUpdateMutation} from '#src/Queries/Fez/FezMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezData, UserNotificationData} from '#src/Structs/ControllerStructs';
import {FezFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgEditScreen>;

export const LfgEditScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.lfgHelpScreen}>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.friendlyfez}
        urlPath={`/lfg/${props.route.params.fez.fezID}/update`}>
        <LfgEditScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const LfgEditScreenInner = ({route, navigation}: Props) => {
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
        fezID: route.params.fez.fezID,
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
          navigation.goBack();
          const invalidations = UserNotificationData.getCacheKeys()
            .concat(FezData.getCacheKeys(route.params.fez.fezID))
            .map(key => queryClient.invalidateQueries({queryKey: key}));
          await Promise.all(invalidations);
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  let startDate = new Date(route.params.fez.startTime || new Date());
  let endDate = new Date(route.params.fez.endTime || new Date());
  const durationMinutes = differenceInMinutes(endDate, startDate);

  const initialValues: FezFormValues = {
    title: route.params.fez.title,
    location: route.params.fez.location,
    fezType: route.params.fez.fezType,
    startDate: startDate,
    duration: durationMinutes.toString(),
    minCapacity: route.params.fez.minParticipants.toString(),
    maxCapacity: route.params.fez.maxParticipants.toString(),
    info: route.params.fez.info,
    startTime: getTimePartsInTz(startDate, tzAtTime(startDate)),
    initialUsers: [],
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        {route.params.fez.cancelled && <FezCanceledView update={true} fezType={route.params.fez.fezType} />}
        <PaddedContentView padTop={true}>
          <LfgForm onSubmit={onSubmit} initialValues={initialValues} buttonText={'Save'} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
