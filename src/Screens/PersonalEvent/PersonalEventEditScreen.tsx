import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {PersonalEventForm} from '#src/Components/Forms/PersonalEventForm';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
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
          screenTitle={fez.fezType === FezType.privateEvent ? 'Edit Private Event' : 'Edit Personal Event'}
          renderForm={({onSubmit, initialValues}) => (
            <PersonalEventForm onSubmit={onSubmit} initialValues={initialValues} create={false} />
          )}
        />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
