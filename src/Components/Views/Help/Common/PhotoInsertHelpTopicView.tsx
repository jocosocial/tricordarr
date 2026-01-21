import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const PhotoInsertHelpTopicView = () => {
  return (
    <HelpTopicView title={'Photos'} icon={AppIcons.insert}>
      Attach photos to your post. You can take a new photo with your camera or select an existing photo from your
      gallery. The maximum number of photos allowed is shown in the insert menu.
    </HelpTopicView>
  );
};
