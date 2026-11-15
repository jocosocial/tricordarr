import React from 'react';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface QuartermasterFABProps {
  /** Preselects this category on the create form. */
  category: QuartermasterCategory;
  showLabel?: boolean;
}

/**
 * Starts a new Quartermastarr item in the category currently being viewed.
 */
export const QuartermasterFAB = ({category, showLabel}: QuartermasterFABProps) => {
  const navigation = useCommonStack();
  return (
    <BaseFAB
      onPress={() => navigation.push(CommonStackComponents.quartermasterCreateScreen, {category})}
      label={'New Item'}
      showLabel={showLabel}
      testID={'quartermasterCreate-fab'}
    />
  );
};
