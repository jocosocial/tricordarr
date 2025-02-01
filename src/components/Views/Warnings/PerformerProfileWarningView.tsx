import React from 'react';
import {ListTitleView} from '../ListTitleView.tsx';

export const PerformerProfileWarningView = () => {
  return (
    <ListTitleView
      title={'This area is only for the Event Organizer'}
      subtitle={'If you want to attend this event this area is not for you.'}
    />
  );
};
