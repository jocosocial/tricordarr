import React from 'react';
import {BaseWarningView} from './BaseWarningView.tsx';

export const PerformerProfileWarningView = () => {
  return (
    <BaseWarningView
      title={'This is only for the Event Organizer'}
      message={'If you want to attend this event this is not for you.'}
    />
  );
};
