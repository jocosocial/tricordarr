import * as React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {AppIcons} from '#src/Enums/Icons';
import {LfgStackComponents, useLFGStackNavigation} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';

interface LfgFABProps {
  showLabel?: boolean;
  /** Cruise day filter from list; 0 = "All". When 0 or undefined, create screen uses current day. */
  cruiseDay?: number;
}

/**
 * Single "New LFG" FAB. Find/Joined/Owned selection now lives in the LfgFilterMenu, not here.
 */
export const LfgFAB = (props: LfgFABProps) => {
  const navigation = useLFGStackNavigation();
  const {adjustedCruiseDayToday} = useCruise();

  const effectiveCruiseDay =
    props.cruiseDay === 0 || props.cruiseDay === undefined ? adjustedCruiseDayToday : props.cruiseDay;

  return (
    <BaseFAB
      icon={AppIcons.new}
      label={'New LFG'}
      showLabel={props.showLabel}
      testID={'lfgCreate-fab'}
      onPress={() => navigation.push(LfgStackComponents.lfgCreateScreen, {cruiseDay: effectiveCruiseDay})}
    />
  );
};
