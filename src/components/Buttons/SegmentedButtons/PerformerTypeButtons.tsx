import React from 'react';
import {SegmentedButtons} from 'react-native-paper';
import {PerformerType} from '../../Queries/Performer/PerformerQueries.ts';
import {Dispatch, SetStateAction} from 'react';
import {SegmentedButtonType} from '../../../libraries/Types';

interface PerformerTypeButtonsProps {
  performerType: PerformerType;
  setPerformerType: Dispatch<SetStateAction<PerformerType>>;
}

export const PerformerTypeButtons = (props: PerformerTypeButtonsProps) => {
  const buttons: SegmentedButtonType[] = [
    {value: 'official', label: 'Official'},
    {value: 'shadow', label: 'Shadow'},
  ];
  const onChange = (value: string) => props.setPerformerType(value as PerformerType);
  return <SegmentedButtons buttons={buttons} value={props.performerType} onValueChange={onChange} />;
};
