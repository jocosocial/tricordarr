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
  const isOwner = fez.owner.userID === currentUserID;
  // Only the owner may change visibility. Moderators reach this screen too, but the server refuses
  // a visibility change from anyone but the owner. On a personalEvent, making it unlisted is a
  // one-way conversion into a privateEvent.
  const showVisibility = isOwner;
  // Adding participants to a personalEvent converts it into a privateEvent. An existing
  // privateEvent manages its participants from the participation screen instead. In
  // pre-registration mode the form shows the field disabled.
  const showParticipants = isOwner && fez.fezType === FezType.personalEvent;
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.personalEventHelpScreen} allowed={true}>
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
              showParticipants={showParticipants}
            />
          )}
        />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
