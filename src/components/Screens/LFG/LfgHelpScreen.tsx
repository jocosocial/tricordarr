import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import React from 'react';
import {HelpChapterTitleView} from '../../Views/Help/HelpChapterTitleView.tsx';
import {HelpTopicView} from '../../Views/Help/HelpTopicView.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';

export const LfgHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView overScroll={true} isStack={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          LFGs are small(ish) community organized events. Use them to play a board game, go on an excursion, eat at a
          restaurant, or do any other group activity.
        </HelpTopicView>
        <HelpTopicView>
          If you're looking for something to do and want to meet some new people: check out the LFGs, find an activity
          that sounds fun, and join up.
        </HelpTopicView>
        <HelpChapterTitleView title={'Limitations'} />
        <HelpTopicView>
          LFGs are meant for small groups doing an activity together. All of the event rooms on the ship are for actual
          scheduled Events. JoCo Cruise does not provide logistical or technical support for LFGs.
        </HelpTopicView>
        <HelpTopicView>
          LFGs are not a reservation system of any sort. Luckily, LFGs have built-in chat, so you can come up with a
          backup plan with everyone and meet somewhere else/play a different game/eat at a different restaurant.
        </HelpTopicView>
        <HelpTopicView>
          People of all ages read Twitt-Arr and LFGs are a public forum like the rest of Twitt-Arr. Please use the usual
          discretion and keep the Code of Conduct in mind.
        </HelpTopicView>
        <HelpChapterTitleView title={'Customization'} />
        <HelpTopicView title={'Filters'} icon={AppIcons.filter}>
          You can filter LFGs by using the filter menus at the top of the screen. A filter is active if the menu icon is
          blue and the item in the list is slightly highlighted. Long press the menu button to clear all active filters.
        </HelpTopicView>
        <HelpTopicView title={'Settings'} icon={AppIcons.settings}>
          You can change the default LFG screen (Find, Joined, Owned) and filter past LFGs by default in the settings.
          Tap the menu in the upper right of any LFG screen and select Settings.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
