import React from 'react';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const HelpManualScreen = () => {
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} noMargin={true}>
          <DataFieldListItem
            title={'General Help'}
            description={'Common buttons, content interactions, and general app features.'}
            icon={AppIcons.help}
            onPress={() => commonNavigation.push(CommonStackComponents.mainHelpScreen)}
          />
          <DataFieldListItem
            title={'Cruise Help'}
            description={'Where to get assistance with the JoCo Cruise event and/or Twitarr.'}
            icon={AppIcons.help}
            onPress={() => commonNavigation.push(CommonStackComponents.cruiseHelpScreen)}
          />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Major Features'}>
          <HelpTopicView>These are the big buttons at the bottom of the app on every screen.</HelpTopicView>
          <DataFieldListItem
            title={'Today'}
            description={'The main landing page of the app showing some useful information.'}
            icon={AppIcons.home}
            onPress={() => commonNavigation.push(CommonStackComponents.todayHelpScreen)}
          />
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
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Community'} noMargin={true}>
          <DataFieldListItem
            title={'User Profile'}
            description={'Your bio and what information is visible to others.'}
            icon={AppIcons.profile}
            onPress={() => commonNavigation.push(CommonStackComponents.userProfileHelpScreen)}
          />
          <DataFieldListItem
            title={'User Directory'}
            description={'Directory of users on the cruise.'}
            icon={AppIcons.user}
            onPress={() => commonNavigation.push(CommonStackComponents.userDirectoryHelpScreen)}
          />
          <DataFieldListItem
            title={'Performers'}
            description={'Official and Shadow performers.'}
            icon={AppIcons.performer}
            onPress={() => commonNavigation.push(CommonStackComponents.performerHelpScreen)}
          />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Entertainment'} noMargin={true}>
          <DataFieldListItem
            title={'Photostream'}
            description={"It's a stream. Of photos. A photostream. Share what you're seeing on the ship."}
            icon={AppIcons.photostream}
            onPress={() => commonNavigation.push(CommonStackComponents.photostreamHelpScreen)}
          />
          <DataFieldListItem
            title={'Board Games'}
            description={'Find and play board games with other attendees.'}
            icon={AppIcons.games}
            onPress={() => commonNavigation.push(CommonStackComponents.boardgameHelpScreen)}
          />
          <DataFieldListItem
            title={'Karaoke'}
            description={'Sing your heart out with other attendees.'}
            icon={AppIcons.karaoke}
            onPress={() => commonNavigation.push(CommonStackComponents.siteUIHelpScreen)}
          />
          <DataFieldListItem
            title={'Daily Themes'}
            description={'Daily themes and what to expect for the day.'}
            icon={AppIcons.dailyTheme}
            onPress={() => commonNavigation.push(CommonStackComponents.dailyThemeHelpScreen)}
          />
          <DataFieldListItem
            title={'Puzzle Hunts'}
            description={'Challenge your brain with puzzle hunts.'}
            icon={AppIcons.hunts}
            onPress={() => commonNavigation.push(CommonStackComponents.siteUIHelpScreen)}
          />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Documentation'} noMargin={true}>
          <DataFieldListItem
            title={'Deck Map'}
            description={'The deck map shows a visual representation of each deck on the ship.'}
            icon={AppIcons.map}
            onPress={() => commonNavigation.push(CommonStackComponents.mapHelpScreen)}
          />
          <DataFieldListItem
            title={'Time Zones'}
            description={'Time zone settings and how to manage time changes.'}
            icon={AppIcons.time}
            onPress={() => commonNavigation.push(CommonStackComponents.timeZoneHelpScreen)}
          />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Special Roles'} noMargin={true}>
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
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Advanced'} noMargin={true}>
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
          <DataFieldListItem
            title={'Disabled Features'}
            description={'Features that are administratively disabled in the app.'}
            icon={AppIcons.disabled}
            onPress={() => commonNavigation.push(CommonStackComponents.disabledHelpScreen)}
          />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'About'} noMargin={true}>
          <DataFieldListItem
            title={'About Tricordarr'}
            description={'This particular client app.'}
            icon={AppIcons.tricordarr}
            onPress={() => commonNavigation.push(CommonStackComponents.aboutTricordarrScreen)}
          />
          <DataFieldListItem
            title={'About Twitarr'}
            description={'The Twitarr service and its history with JoCo Cruise.'}
            icon={AppIcons.twitarr}
            onPress={() => commonNavigation.push(CommonStackComponents.aboutTwitarrScreen)}
          />
          <DataFieldListItem
            title={'Privacy Policy'}
            description={'View the service and app privacy policies.'}
            icon={AppIcons.privacy}
            onPress={() => commonNavigation.push(CommonStackComponents.privacyScreen)}
          />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
