import React from 'react';
import {BaseFAB} from './BaseFAB.tsx';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';

interface PersonalEventsFABProps {
  showLabel?: boolean;
}

export const PersonalEventsFAB = (props: PersonalEventsFABProps) => {
  const navigation = useCommonStack();
  return (
    <BaseFAB
      onPress={() => navigation.push(CommonStackComponents.personalEventCreateScreen)}
      label={props.showLabel ? 'New Personal Event' : undefined}
    />
  );
};
