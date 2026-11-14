import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {PersonalEventForm} from '#src/Components/Forms/PersonalEventForm';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezForm} from '#src/Hooks/Fez/useFezForm';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezCreateScreenBase} from '#src/Screens/Fez/FezCreateScreenBase';

export const PersonalEventCreateScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.personalEventHelpScreen} allowed={true}>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={'/privateevent/create'}>
        <PersonalEventCreateScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.personalEventCreateScreen>;

const PersonalEventCreateScreenInner = ({route}: Props) => {
  const navigation = useCommonStack();
  const {getInitialValues, personalEventRequiresPrivate} = useFezForm();
  const {createFez} = useFezCacheReducer();
  const {preRegistrationMode} = usePreRegistration();
  const initialValues = getInitialValues({
    cruiseDay: route.params.cruiseDay,
    fezType: FezType.personalEvent,
    duration: '30',
    minCapacity: '0',
    maxCapacity: '0',
    // Pre-registration users can't add other users.
    initialUsers: preRegistrationMode ? [] : (route.params?.initialUserHeaders ?? []),
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
        visibility: values.visibility,
        // An unlisted event must be a privateEvent: the server rejects any visibility other than
        // the type default on a personalEvent, and only a privateEvent can be self-joined by link.
        fezType: personalEventRequiresPrivate(values) ? FezType.privateEvent : FezType.personalEvent,
      })}
      onSuccess={response => {
        createFez(response);
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
