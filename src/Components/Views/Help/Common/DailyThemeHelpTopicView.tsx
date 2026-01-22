import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const DailyThemeHelpTopicView = ({showTitle = true}: {showTitle?: boolean}) => {
  return (
    <HelpTopicView title={showTitle ? 'Daily Theme' : undefined}>
      Most days of the cruise have a theme that may inspire costumes, activities, or conversations. You can view all
      daily themes from the Daily Themes screen.
    </HelpTopicView>
  );
};
