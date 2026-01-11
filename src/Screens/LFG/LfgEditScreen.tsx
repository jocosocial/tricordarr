import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {addMinutes, differenceInMinutes} from 'date-fns';
import {FormikHelpers} from 'formik';
import React from 'react';

import {LfgForm} from '#src/Components/Forms/LfgForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {FezCanceledView} from '#src/Components/Views/Static/FezCanceledView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {getEventTimezoneOffset, getScheduleItemStartEndTime} from '#src/Libraries/DateTime';
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
        {route.params.fez.cancelled && <FezCanceledView update={true} fezType={route.params.fez.fezType} />}
        <PaddedContentView padTop={true}>
          <LfgForm onSubmit={onSubmit} initialValues={initialValues} buttonText={'Save'} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
