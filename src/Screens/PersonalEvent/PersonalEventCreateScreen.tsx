import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {PersonalEventForm} from '#src/Components/Forms/PersonalEventForm';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {useFezForm} from '#src/Hooks/useFezForm';
import {CommonStackComponents, CommonStackParamList, useCommonStack} from '#src/Navigation/CommonScreens';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezCreateScreenBase} from '#src/Screens/Fez/FezCreateScreenBase';
import {FezData, UserNotificationData} from '#src/Structs/ControllerStructs';

export const PersonalEventCreateScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.personalEventHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={'/privateevent/create'}>
        <PersonalEventCreateScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.personalEventCreateScreen>;

const PersonalEventCreateScreenInner = ({route}: Props) => {
  const navigation = useCommonStack();
  const {getInitialValues} = useFezForm();
  const initialValues = getInitialValues({
    cruiseDay: route.params.cruiseDay,
    fezType: FezType.personalEvent,
    duration: '30',
    minCapacity: '0',
    maxCapacity: '0',
    initialUsers: route.params?.initialUserHeaders ?? [],
  });

  return (
    <FezCreateScreenBase
      initialValues={initialValues}
      buildFezContentData={(values, startTime, endTime) => ({
        title: values.title,
        info: values.info,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: values.location,
        minCapacity: 0,
        maxCapacity: 0,
        initialUsers: values.initialUsers.map(u => u.userID),
        fezType: values.initialUsers.length > 0 ? FezType.privateEvent : FezType.personalEvent,
      })}
      onSuccess={async (response, queryClient) => {
        await Promise.all([
          ...UserNotificationData.getCacheKeys().map(key => queryClient.invalidateQueries({queryKey: key})),
          ...FezData.getCacheKeys().map(key => queryClient.invalidateQueries({queryKey: key})),
        ]);
        navigation.replace(CommonStackComponents.personalEventScreen, {
          eventID: response.fezID,
        });
      }}
      helpScreen={CommonStackComponents.personalEventHelpScreen}
      renderForm={({onSubmit, initialValues: formInitialValues}) => (
        <PersonalEventForm initialValues={formInitialValues} onSubmit={onSubmit} />
      )}
    />
  );
};
