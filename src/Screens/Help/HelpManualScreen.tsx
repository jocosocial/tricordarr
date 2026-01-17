import React from 'react';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const HelpManualScreen = () => {
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <ListSubheader>General</ListSubheader>
        <DataFieldListItem
          title={'General Help'}
          description={'Common buttons, content interactions, and general app features.'}
          icon={AppIcons.help}
          onPress={() => commonNavigation.push(CommonStackComponents.mainHelpScreen)}
        />
        <ListSubheader>Major Features</ListSubheader>
        <DataFieldListItem
          title={'Forums'}
          description={'Forums, threads, posts, and how to participate in discussions.'}
          icon={AppIcons.forum}
          onPress={() => commonNavigation.push(CommonStackComponents.forumHelpScreen)}
        />
        <DataFieldListItem
          title={'Seamail'}
          description={'Private messaging and group conversations.'}
          icon={AppIcons.seamail}
          onPress={() => commonNavigation.push(CommonStackComponents.seamailHelpScreen)}
        />
        <DataFieldListItem
          title={'Looking For Group (LFG)'}
          description={'Self-organized activities with other cruisers.'}
          icon={AppIcons.lfg}
          onPress={() => commonNavigation.push(CommonStackComponents.lfgHelpScreen)}
        />
        <DataFieldListItem
          title={'Schedule'}
          description={'Events, the schedule, day planner, and how to manage your cruise day.'}
          icon={AppIcons.events}
          onPress={() => commonNavigation.push(CommonStackComponents.scheduleHelpScreen)}
        />
        <DataFieldListItem
          title={'Personal Events'}
          description={'Create personal calendar events to track your schedule and locations.'}
          icon={AppIcons.personalEvent}
          onPress={() => commonNavigation.push(CommonStackComponents.personalEventCreateHelpScreen)}
        />
        <DataFieldListItem
          title={'Performers'}
          description={'Official and Shadow performers.'}
          icon={AppIcons.performer}
          onPress={() => commonNavigation.push(CommonStackComponents.performerHelpScreen)}
        />
        <ListSubheader>User & Profile</ListSubheader>
        <DataFieldListItem
          title={'User Profile'}
          description={'Your bio and what information is visible to others.'}
          icon={AppIcons.profile}
          onPress={() => commonNavigation.push(CommonStackComponents.userProfileHelpScreen, {})}
        />
        <DataFieldListItem
          title={'User Relations'}
          description={'Blocking, muting, and favoriting users.'}
          icon={AppIcons.userFavorite}
          onPress={() => commonNavigation.push(CommonStackComponents.userRelationsHelpScreen)}
        />
        <DataFieldListItem
          title={'User Directory'}
          description={'Directory of users on the cruise.'}
          icon={AppIcons.user}
          onPress={() => commonNavigation.push(CommonStackComponents.userDirectoryHelpScreen)}
        />
        <ListSubheader>Other</ListSubheader>
        <DataFieldListItem
          title={'Time Zones'}
          description={'Time zone settings and how to manage time changes.'}
          icon={AppIcons.time}
          onPress={() => commonNavigation.push(CommonStackComponents.timeZoneHelpScreen)}
        />
        <DataFieldListItem
          title={'Deck Map'}
          description={'Navigate the ship using deck maps and find your way around.'}
          icon={AppIcons.map}
          onPress={() => commonNavigation.push(CommonStackComponents.mapHelpScreen)}
        />
        <DataFieldListItem
          title={'Webview'}
          description={'Integrated webview and how to use Twitarr features not yet in the app.'}
          icon={AppIcons.webview}
          onPress={() => commonNavigation.push(CommonStackComponents.siteUIHelpScreen)}
        />
        <DataFieldListItem
          title={'Pre-Registration'}
          description={'Features that are available before the cruise starts.'}
          icon={AppIcons.help}
          onPress={() => commonNavigation.push(CommonStackComponents.preRegistrationHelpScreen)}
        />
        <ListSubheader>Special Roles</ListSubheader>
        <DataFieldListItem
          title={'Shutternauts'}
          description={'App-specific guidance for shutternauts.'}
          icon={AppIcons.shutternaut}
          onPress={() => commonNavigation.push(CommonStackComponents.shutternautHelpScreen)}
        />
        <DataFieldListItem
          title={'Moderators'}
          description={'App-specific guidance for moderators.'}
          icon={AppIcons.moderator}
          onPress={() => commonNavigation.push(CommonStackComponents.moderatorHelpScreen)}
        />
        <ListSubheader>About</ListSubheader>
        <DataFieldListItem
          title={'About Tricordarr'}
          description={'The Tricordarr app and the project.'}
          icon={AppIcons.tricordarr}
          onPress={() => commonNavigation.push(CommonStackComponents.aboutTricordarrScreen)}
        />
        <DataFieldListItem
          title={'About Twitarr'}
          description={'The Twitarr service and its history with JoCo Cruise.'}
          icon={AppIcons.twitarr}
          onPress={() => commonNavigation.push(CommonStackComponents.aboutTwitarrScreen)}
        />
      </ScrollingContentView>
    </AppView>
  );
};
