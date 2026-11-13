import React from 'react';
import {SegmentedButtons} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {SegmentedButtonType} from '#src/Types';

interface QuartermasterCategoryButtonsProps {
  category: QuartermasterCategory;
  setCategory: (category: QuartermasterCategory) => void;
}

/**
 * Have/Need toggle for the Quartermastarr list, built like the Performers Official/Shadow toggle.
 */
export const QuartermasterCategoryButtons = ({category, setCategory}: QuartermasterCategoryButtonsProps) => {
  const buttons: SegmentedButtonType[] = QuartermasterCategory.all.map(c => ({
    value: c,
    label: QuartermasterCategory.getLabel(c),
    icon: c === QuartermasterCategory.have ? AppIcons.quartermasterHave : AppIcons.quartermasterNeed,
    testID: `quartermaster${QuartermasterCategory.getLabel(c)}-button`,
  }));
  const onChange = (value: string) => setCategory(value as QuartermasterCategory);
  return <SegmentedButtons buttons={buttons} value={category} onValueChange={onChange} />;
};
