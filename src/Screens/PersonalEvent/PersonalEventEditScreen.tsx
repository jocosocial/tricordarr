import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {PersonalEventForm} from '#src/Components/Forms/PersonalEventForm';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezEditScreenBase} from '#src/Screens/Fez/FezEditScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.personalEventEditScreen>;

export const PersonalEventEditScreen = (props: Props) => {
  const fez = props.route.params.personalEvent;
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.personalEventHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={`/privateevent/${fez.fezID}/update`}>
        <FezEditScreenBase
          fez={fez}
          intent={props.route.params.intent}
          helpScreen={CommonStackComponents.personalEventHelpScreen}
          screenTitle={'Edit Private Event'}
          renderForm={({onSubmit, initialValues}) => (
            <PersonalEventForm onSubmit={onSubmit} initialValues={initialValues} create={false} />
          )}
        />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
