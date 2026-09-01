import React from 'react';

import {ListTitleView} from '#src/Components/Views/ListTitleView';

/**
 * Banner on the host feedback form: this is for shadow hosts, not attendees.
 */
export const EventFeedbackHostWarningView = () => {
  return (
    <ListTitleView
      title={'For Event Hosts Only'}
      subtitle={
        "Please don't use this to give feedback about events you attended. Save that for the post-cruise survey."
      }
    />
  );
};
