import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const MapHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          The deck map shows a visual representation of each deck on the ship. Use it to find your way around and locate
          rooms, venues, and other important locations.
        </HelpTopicView>
        <HelpTopicView>
          The map displays forward (front)/aft (back) port (left)/starboard (right) indicators to help you orient
          yourself.
        </HelpTopicView>
        <HelpChapterTitleView title={'Header Buttons'} />
        <HelpTopicView title={'Deck Menu'} icon={AppIcons.decks}>
          Tap the deck menu button in the header to quickly switch between different decks. The current deck is
          highlighted in the menu.
        </HelpTopicView>
        <HelpButtonHelpTopicView />
      </ScrollingContentView>
    </AppView>
  );
};
