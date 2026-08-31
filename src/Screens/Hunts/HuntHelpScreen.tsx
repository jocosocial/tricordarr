import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

/**
 * Help content for puzzle hunts: unlocks, answer matching, and submit.
 */
export const HuntHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Puzzle hunts are collections of puzzles that unlock over the cruise. Open a hunt to see currently available
          puzzles, then call in answers to track your progress.
        </HelpTopicView>
        <HelpTopicView title={'Unlocks'}>
          Puzzles may unlock at a scheduled time. Locked puzzles stay hidden until then; the hunt screen notes when the
          next one opens.
        </HelpTopicView>
        <HelpTopicView title={'Answers'}>
          Submissions are compared after ignoring case, spacing, and punctuation. A matching hint (not the full answer)
          shows a nudge instead of "Incorrect". Once you solve a puzzle you cannot submit more guesses, and the hunt
          list shows the canonical answer.
        </HelpTopicView>
        <HelpChapterTitleView title={'Actions'} />
        <HelpTopicView icon={AppIcons.hunts} title={'Submit'}>
          Enter an answer on an unsolved puzzle and press Submit. Duplicate guesses return your earlier result.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
