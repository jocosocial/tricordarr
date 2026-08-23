import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const RecoveryKeyHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Your recovery key can be used if you lose access to your account and cannot recover your password. It can be
            used only once and is shown only on this screen after you create an account.
          </HelpTopicView>
          <HelpTopicView>
            Write it down or take a screenshot before continuing. Press the key to copy it to your clipboard, or
            long-press to select it.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Acknowledged'} icon={AppIcons.registrationCode}>
            Confirm that you have saved your recovery key. This returns you to the screen you were on before
            registration. Back is disabled until you acknowledge so the key cannot be dismissed accidentally.
          </HelpTopicView>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
