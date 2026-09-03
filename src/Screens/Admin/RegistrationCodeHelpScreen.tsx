import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

/**
 * Help for registration codes: admin lookup, per-user details, and Discord allocation.
 */
export const RegistrationCodeHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            Each cruise passenger gets a unique six-character registration code from THO by email before sailing. A code
            is required to create a primary Twitarr account and can be used for password recovery.
          </HelpTopicView>
          <HelpTopicView>Codes are stored and matched without spaces or capitalization.</HelpTopicView>
          <HelpTopicView>
            TwitarrTeam and Account Managers can look up a code or a user, see related alt accounts, and unlock password
            recovery. Discord allocation is a pre-production tool and does not apply on the boat.
          </HelpTopicView>
          <HelpTopicView>Guests who lose their code can get a new one from the Info Desk.</HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Account Recovery'}>
          <HelpTopicView>
            Users can use their registration code to recover their account once. If they did not save their recovery key
            (shown only once during registration) then they will need their code unlocked which can be done by
            TwitarrTeam and above or users with the Account Manager role.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Discord Codes'}>
          <HelpTopicView>
            Pre-production servers keep a separate pool of codes for TwitarrTeam to give Discord testers. Enter a
            Discord username and Allocate to assign an unused Discord code. Production servers typically have zero
            Discord codes, so this will fail on the boat.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpTopicView title={'Stats'} icon={AppIcons.statistics}>
            On Registration Codes, open usage counts for allocated, used, unused, and Discord codes.
          </HelpTopicView>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
