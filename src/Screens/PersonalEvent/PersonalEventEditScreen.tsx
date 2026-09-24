import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {PersonalEventForm} from '#src/Components/Forms/PersonalEventForm';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezEditScreenBase} from '#src/Screens/Fez/FezEditScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.personalEventEditScreen>;

export const PersonalEventEditScreen = (props: Props) => {
  const fez = props.route.params.personalEvent;
  const {currentUserID} = useSession();
  // Only the owner of an existing privateEvent may change visibility. Moderators reach this
  // screen too, but the server refuses a visibility change from anyone but the owner.
  const showVisibility = fez.fezType === FezType.privateEvent && fez.owner.userID === currentUserID;
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.personalEventHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={`/privateevent/${fez.fezID}/update`}>
        <FezEditScreenBase
          fez={fez}
          intent={props.route.params.intent}
          helpScreen={CommonStackComponents.personalEventHelpScreen}
          screenTitle={'Edit Private Event'}
          renderForm={({onSubmit, initialValues}) => (
            <PersonalEventForm
              onSubmit={onSubmit}
              initialValues={initialValues}
              create={false}
              showVisibility={showVisibility}
            />
          )}
        />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
