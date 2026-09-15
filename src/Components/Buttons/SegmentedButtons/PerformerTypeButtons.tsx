import React, {Dispatch, SetStateAction} from 'react';
import {SegmentedButtons} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {PerformerType} from '#src/Queries/Performer/PerformerQueries';
import {SegmentedButtonType} from '#src/Types';

interface PerformerTypeButtonsProps {
  performerType: PerformerType;
  setPerformerType: Dispatch<SetStateAction<PerformerType>>;
}

export const PerformerTypeButtons = (props: PerformerTypeButtonsProps) => {
  const buttons: SegmentedButtonType[] = [
    {value: 'official', label: 'Official', icon: AppIcons.official, testID: 'performerOfficial-button'},
    {value: 'shadow', label: 'Shadow', testID: 'performerShadow-button'},
  ];
  const onChange = (value: string) => props.setPerformerType(value as PerformerType);
  return <SegmentedButtons buttons={buttons} value={props.performerType} onValueChange={onChange} />;
};
