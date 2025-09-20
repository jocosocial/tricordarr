import React from 'react';
import {SegmentedButtons} from 'react-native-paper';
import {PerformerType} from '#src/Queries/Performer/PerformerQueries';
import {Dispatch, SetStateAction} from 'react';
import {SegmentedButtonType} from '#src/Types';
import {AppIcons} from '#src/Enums/Icons';

interface PerformerTypeButtonsProps {
  performerType: PerformerType;
  setPerformerType: Dispatch<SetStateAction<PerformerType>>;
}

export const PerformerTypeButtons = (props: PerformerTypeButtonsProps) => {
  const buttons: SegmentedButtonType[] = [
    {value: 'official', label: 'Official', icon: AppIcons.official},
    {value: 'shadow', label: 'Shadow'},
  ];
  const onChange = (value: string) => props.setPerformerType(value as PerformerType);
  return <SegmentedButtons buttons={buttons} value={props.performerType} onValueChange={onChange} />;
};
