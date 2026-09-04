import React, {Dispatch, SetStateAction} from 'react';
import {SegmentedButtons} from 'react-native-paper';

import {SegmentedButtonType} from '#src/Types';

export type EventFeedbackSelectTab = 'all' | 'yours';

interface EventFeedbackSelectButtonsProps {
  tab: EventFeedbackSelectTab;
  setTab: Dispatch<SetStateAction<EventFeedbackSelectTab>>;
}

/**
 * Tab bar for the host feedback event picker: all eligible events, or reports the current user already submitted.
 */
export const EventFeedbackSelectButtons = ({tab, setTab}: EventFeedbackSelectButtonsProps) => {
  const buttons: SegmentedButtonType[] = [
    {value: 'all', label: 'All', testID: 'eventFeedbackAll-button'},
    {value: 'yours', label: 'Yours', testID: 'eventFeedbackYours-button'},
  ];

  return (
    <SegmentedButtons buttons={buttons} value={tab} onValueChange={value => setTab(value as EventFeedbackSelectTab)} />
  );
};
