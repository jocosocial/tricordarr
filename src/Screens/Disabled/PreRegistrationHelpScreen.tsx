import React from 'react';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';

export const PreRegistrationHelpScreen = () => {
  const mainNavigation = useMainStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'Pre-Registration Mode'} />
        <HelpTopicView>
          Only limited user features are available in pre-registration mode. This is because there is no land-based
          moderation team. And the TwitarrTeam needs to finish packing.
        </HelpTopicView>
        <HelpTopicView>
          Tap any of the following actions to quickly get started. Reminder that everything is optional! Do as much or
          as little as you want.
        </HelpTopicView>
        <ListSubheader>Available Actions</ListSubheader>
        <DataFieldListItem
          title={'Profile'}
          description={
            'Fill out a user profile that will be visible to other Twitarr users. This is where you can upload a photo of yourself or set preferred pronouns.'
          }
          icon={AppIcons.profile}
          onPress={() => mainNavigation.push(CommonStackComponents.userSelfProfileScreen)}
        />
        <DataFieldListItem
          title={'Events'}
          description={
            "Follow official and shadow events in the schedule. This will add them to your in-app day planner and generate reminder notifications. You can also import favorites from a Sched.com account if you've done this over there already."
          }
          icon={AppIcons.events}
          onPress={() => mainNavigation.navigate(CommonStackComponents.scheduleDayScreen, {noDrawer: true})}
        />
        <DataFieldListItem
          title={'Performer'}
          description={
            "If you are hosting a Shadow Cruise event you can optionally create a performer profile for yourself. This will be visible to other Twitarr users and will be attached to the event you're hosting. This is separate from your Twitarr user profile."
          }
          icon={AppIcons.performer}
          onPress={() => mainNavigation.push(CommonStackComponents.scheduleDayScreen, {noDrawer: true})}
        />
        <DataFieldListItem
          title={'Settings'}
          description={
            'There are a bunch of settings you can configure within the app. Use these to customize your experience.'
          }
          icon={AppIcons.settings}
          onPress={() => mainNavigation.push(MainStackComponents.mainSettingsScreen)}
        />
        <DataFieldListItem
          title={'Help Manual'}
          description={
            'Read help documentation about all the features in this app. You can also learn more about the client applications and how to contribute to the project.'
          }
          icon={AppIcons.help}
          onPress={() => mainNavigation.push(CommonStackComponents.helpIndexScreen)}
        />
      </ScrollingContentView>
    </AppView>
  );
};
