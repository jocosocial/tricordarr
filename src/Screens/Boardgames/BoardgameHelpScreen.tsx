import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const BoardgameHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView title={'Play Time'}>
          Play time is the manufacturers specification. JoCo Cruise recommends adding 20-30 minutes if your party has
          not played before.
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.games} title={'Game Guide'}>
          You can use the game guide to get recommendations of games to play based on your party size, time limit, age,
          and complexity. You can always consult with the board game librarians on board!
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.lfgCreate} title={'Create LFG'}>
          Press this button in the board game screen header to create an LFG to play this game. Make some new friends!
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
