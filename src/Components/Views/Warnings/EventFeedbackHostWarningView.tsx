import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

/**
 * Banner on the host feedback form: this is for shadow hosts, not attendees.
 */
export const EventFeedbackHostWarningView = () => {
  const {commonStyles} = useStyles();

  return (
    <BaseWarningView
      variant={'negative'}
      title={'For Event Hosts Only'}
      message={
        "Please don't use this to give feedback about events you attended. Save that for the post-cruise survey."
      }
      containerStyle={commonStyles.paddingHorizontal}
    />
  );
};
