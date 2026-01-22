import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const BoardgameHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Explore the on-board board game library and find a game to play! The library is typically located in the Main
          Dining Room on Deck 3 aft. Find a member of the board game team if you need help.
        </HelpTopicView>
        <HelpTopicView title={'Play Time'}>
          Play time is the manufacturers specification. JoCo Cruise recommends adding 20-30 minutes if your party has
          not played before.
        </HelpTopicView>
        <HelpChapterTitleView title={'Game Guide'} />
        <HelpTopicView icon={AppIcons.games}>
          You can use the game guide to get recommendations of games to play based on your party size, time limit, age,
          and complexity. You can always consult with the board game librarians on board!
        </HelpTopicView>
        <HelpChapterTitleView title={'Actions'} />
        <HelpTopicView icon={AppIcons.lfgCreate} title={'Create LFG'}>
          Press this button in the board game screen header to create an LFG to play this game. Make some new friends!
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.lfgCreate} title={'Favorite'}>
          Add a game to your favorites list, making it easier to find later.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
