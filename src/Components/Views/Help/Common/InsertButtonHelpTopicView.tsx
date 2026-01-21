import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

interface InsertButtonHelpTopicViewProps {
  enablePhotos?: boolean;
}

export const InsertButtonHelpTopicView = ({enablePhotos = true}: InsertButtonHelpTopicViewProps = {}) => {
  const contentText = enablePhotos
    ? 'Open the insert menu to add emoji, photos, or other content to your post. Press again to close the menu.'
    : 'Open the insert menu to add emoji or other content to your post. Press again to close the menu.';

  return (
    <HelpTopicView title={'Insert'} icon={AppIcons.insert}>
      {contentText}
    </HelpTopicView>
  );
};
