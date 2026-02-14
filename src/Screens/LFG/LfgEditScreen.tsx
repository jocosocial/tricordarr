import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {LfgForm} from '#src/Components/Forms/LfgForm';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezEditScreenBase} from '#src/Screens/Fez/FezEditScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgEditScreen>;

export const LfgEditScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.lfgHelpScreen}>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.friendlyfez}
        urlPath={`/lfg/${props.route.params.fez.fezID}/update`}>
        <FezEditScreenBase
          fez={props.route.params.fez}
          renderForm={({onSubmit, initialValues}) => (
            <LfgForm onSubmit={onSubmit} initialValues={initialValues} buttonText={'Save'} />
          )}
        />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
