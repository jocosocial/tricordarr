import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ClearSearchHelpTopicView} from '#src/Components/Views/Help/Common/ClearSearchHelpTopicView';
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
            Each cruise passenger gets a unique six-character registration code from THO, usually mailed as two groups
            of three letters such as ABC DEF. Codes are stored and matched without spaces or capitalization. A code is
            required to create a primary Twitarr account and can be used once for password recovery.
          </HelpTopicView>
          <HelpTopicView>
            TwitarrTeam and Account Managers can look up a code or a user, see related alt accounts, and unlock password
            recovery. Discord allocation is a pre-production tool and does not apply on the boat.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Find By Code'}>
          <HelpTopicView>
            Enter a code and tap Find. Spaces are optional. The code is checked for a valid 6-character alphanumeric
            form before the server is queried. A valid unused code shows that no account exists yet. A used code lists
            the primary account first, then any alts. Tap a user to open their registration details.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Find By User'}>
          <HelpTopicView>
            Search by exact username, then tap the user to open their registration details. The primary account, alts,
            and the shared code are all reachable from any related username.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Registration Details'}>
          <HelpTopicView>
            Shows the code, when the primary account was created, and whether the code has already been used for
            password recovery. Long-press the code to copy it. Related Accounts lists the primary user and alts; tap one
            to open that profile.
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
          <HelpTopicView title={'Find'} icon={AppIcons.search}>
            On Registration Codes, submit a well-formed code lookup.
          </HelpTopicView>
          <ClearSearchHelpTopicView />
          <HelpTopicView title={'Stats'} icon={AppIcons.statistics}>
            On Registration Codes, open usage counts for allocated, used, unused, and Discord codes.
          </HelpTopicView>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'}>
          <HelpTopicView title={'Unlock'} icon={AppIcons.password}>
            On a user's registration details, re-enable one-time password recovery via registration code after it has
            been spent. Also clears a lockout from too many failed recovery attempts. Disabled until the code has been
            used for recovery.
          </HelpTopicView>
          <HelpTopicView title={'Allocate'} icon={AppIcons.registrationCode}>
            On Discord Codes, assign a pre-prod registration code to a Discord username. TwitarrTeam only.
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
