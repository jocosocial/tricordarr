import React from 'react';

import {HelpFABView} from '#src/Components/Buttons/FloatingActionButtons/HelpFABView';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

/**
 * Help for managing puzzle hunts: creating hunts, editing puzzles, and who can do it.
 */
export const HuntManageHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            A hunt is a collection of puzzles that players work through over the cruise. Manage Puzzle Hunts is in the
            Special Roles section of the app drawer, and is available to users with the Hunt Manager role and to
            TwitarrTeam and above.
          </HelpTopicView>
          <HelpTopicView>
            The hunt list shows every hunt on the server. Open one to edit it, or use the New Hunt button to make
            another.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Hunts'}>
          <HelpTopicView title={'Creating'}>
            A new hunt takes a title, a description, and an optional Puzzles JSON array. Each entry in that array needs
            title, body, and answer strings, and may also carry a hints object and an ISO8601 unlockTime. Invalid JSON
            is reported on the field and nothing is sent to the server.
          </HelpTopicView>
          <HelpTopicView title={'Editing'}>
            Editing an existing hunt changes only its title and description. Puzzles are edited one at a time from the
            list below the form; the Puzzles JSON field is offered on creation only.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Puzzles'}>
          <HelpTopicView>
            A puzzle has a title, a body, and the answer players must match. Answers are compared without spaces or
            capitalization.
          </HelpTopicView>
          <HelpTopicView title={'Unlock Time'}>
            Leave "No unlock time" on to make the puzzle available immediately and clear any schedule. Turn it off to
            pick the date and time the puzzle unlocks.
          </HelpTopicView>
          <HelpTopicView title={'Hints'}>
            Hints are a JSON object mapping a wrong-but-close guess to the nudge players see instead of "Incorrect". Use
            an empty object for none.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Floating Action Button'}>
          <HelpFABView icon={AppIcons.new} label={'New Hunt'} />
          <HelpTopicView>
            Press the "New Hunt" button in the lower right of the hunt list to create a hunt.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Privileged Actions'}>
          <HelpTopicView title={'Delete Hunt'}>
            At the bottom of an existing hunt. Deletes the hunt and all of its puzzles after a confirmation. This cannot
            be undone.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
