import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const OverlappingHelpTopicView = () => {
  return (
    <HelpTopicView title={'Overlapping'} icon={AppIcons.calendarMultiple}>
      View events, LFGs, and personal events that occur at the same time as this event. Use the "Only your events"
      filter to restrict the list to events you're participating in, events you own, or events you've favorited. You
      can configure a setting to exclude long events (by default, events 4 hours or longer) from the overlap list.
    </HelpTopicView>
  );
};
