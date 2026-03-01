import React from 'react';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const LfgHelpScreen = () => {
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <HelpTopicView>
            LFGs are small(ish) community organized events. Use them to play a board game, go on an excursion, eat at a
            restaurant, or do any other group activity.
          </HelpTopicView>
          <HelpTopicView>
            If you're looking for something to do and want to meet some new people: check out the LFGs, find an activity
            that sounds fun, and join up.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Limitations'}>
          <HelpTopicView>
            LFGs are meant for small groups doing an activity together. All of the event rooms on the ship are for
            actual scheduled Events. JoCo Cruise does not provide logistical or technical support for LFGs.
          </HelpTopicView>
          <HelpTopicView>
            LFGs are not a reservation system of any sort. Luckily, LFGs have built-in chat, so you can come up with a
            backup plan with everyone and meet somewhere else/play a different game/eat at a different restaurant.
          </HelpTopicView>
          <HelpTopicView>
            People of all ages read Twitt-Arr and LFGs are a public forum like the rest of Twitt-Arr. Please use the
            usual discretion and keep the Code of Conduct in mind.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Screens'} noMargin={true}>
          <DataFieldListItem
            title={'List (Default)'}
            description={'Browse and manage LFG events.'}
            icon={AppIcons.lfg}
            onPress={() => commonNavigation.push(CommonStackComponents.lfgListHelpScreen)}
          />
          <DataFieldListItem
            title={'Create'}
            description={'Create a new LFG event.'}
            icon={AppIcons.new}
            onPress={() => commonNavigation.push(CommonStackComponents.lfgCreateHelpScreen)}
          />
          <DataFieldListItem
            title={'Participation'}
            description={'Guidelines for managing LFG participants.'}
            icon={AppIcons.lfgJoined}
            onPress={() => commonNavigation.push(CommonStackComponents.lfgParticipationHelpScreen)}
          />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
