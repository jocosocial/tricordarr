import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import React from 'react';
import {HelpChapterTitleView} from '#src/Views/Help/HelpChapterTitleView.tsx';
import {HelpTopicView} from '#src/Views/Help/HelpTopicView.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';

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
        <HelpChapterTitleView title={'Participation'} />
        <HelpTopicView>Don't just add random people to your LFG. It's not nice.</HelpTopicView>
        <HelpTopicView>If you add people to your LFG, those people should already expect to be added.</HelpTopicView>
        <HelpTopicView>
          Same idea with removing people: those removed should know why. Don't remove people who signed up just to bump
          your friend off the waitlist.
        </HelpTopicView>
        <HelpTopicView>
          If you schedule a "Drink Like a Pirate" LFG and someone joins and asks if they can come as a ninja instead,
          you may tell them it's more of a pirate thing and you may need to remove them to make room for more pirate
          participants.
        </HelpTopicView>
        <HelpChapterTitleView title={'Group Lists'} />
        <HelpTopicView icon={AppIcons.lfgJoined} title={'Joined'}>
          These are LFGs that you have joined. This also includes any LFGs that you created.
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.lfgOwned} title={'Owned'}>
          These are LFGs that you have created.
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.lfgFind} title={'Find'}>
          These are LFGs created by others that you can join.
        </HelpTopicView>
        <HelpTopicView icon={AppIcons.lfgFormer} title={'Former'}>
          These are Seamails, LFGs and Personal Events that you were previously a member of, but have since left or been
          removed from. You can use this to report any content that you can no longer access. You still will be unable
          to directly view the content.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
