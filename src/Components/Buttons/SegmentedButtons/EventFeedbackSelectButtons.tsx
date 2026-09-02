import React, {Dispatch, SetStateAction, useMemo} from 'react';
import {SegmentedButtons} from 'react-native-paper';

import {SegmentedButtonType} from '#src/Types';

export type EventFeedbackSelectTab = 'performer' | 'room' | 'all';

interface EventFeedbackSelectButtonsProps {
  tab: EventFeedbackSelectTab;
  setTab: Dispatch<SetStateAction<EventFeedbackSelectTab>>;
  showPerformer: boolean;
  showRoom: boolean;
}

/**
 * Tab bar for the host feedback event picker. Only tabs with matching events are shown; All is always present.
 */
export const EventFeedbackSelectButtons = ({tab, setTab, showPerformer, showRoom}: EventFeedbackSelectButtonsProps) => {
  const buttons: SegmentedButtonType[] = useMemo(() => {
    const result: SegmentedButtonType[] = [];
    if (showPerformer) {
      result.push({value: 'performer', label: 'Performer', testID: 'eventFeedbackPerformer-button'});
    }
    if (showRoom) {
      result.push({value: 'room', label: 'Room', testID: 'eventFeedbackRoom-button'});
    }
    result.push({value: 'all', label: 'All', testID: 'eventFeedbackAll-button'});
    return result;
  }, [showPerformer, showRoom]);

  return (
    <SegmentedButtons buttons={buttons} value={tab} onValueChange={value => setTab(value as EventFeedbackSelectTab)} />
  );
};
