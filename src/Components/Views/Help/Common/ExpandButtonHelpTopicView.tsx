import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

/**
 * Help for ExpandHeaderButton on the Day Planner style timelines.
 */
export const ExpandButtonHelpTopicView = () => {
  return (
    <HelpTopicView title={'Expand'} icon={AppIcons.expandHorizontal}>
      By default every event fits on screen, which gets cramped when many events happen at once. Expand gives each event
      a fixed width and lets you scroll sideways to see the rest. On screens that swipe between days, swiping scrolls
      the events instead while expanded; use the day buttons to change days. To start expanded every time, turn on
      Expand Timelines by Default in Schedule Settings.
    </HelpTopicView>
  );
};
