import {PropsWithChildren} from 'react';

import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

/**
 * Help topic for Download actions that present the save-or-share sheet.
 */
export const DownloadButtonHelpTopicView = ({children}: PropsWithChildren) => {
  return (
    <HelpTopicView title={'Download'} icon={AppIcons.download}>
      {children ?? 'Save this file to a folder on your device, or share it with another app.'}
    </HelpTopicView>
  );
};
