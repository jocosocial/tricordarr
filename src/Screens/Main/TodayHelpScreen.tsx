import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

export const TodayHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          The Today screen is your main landing page when you open the app. It provides an overview of important
          information and quick access to key features.
        </HelpTopicView>
        <HelpChapterTitleView title={'Content'} />
        <HelpTopicView title={'Timezone Warning'}>
          If your device's timezone doesn't match the cruise timezone, you'll see a warning at the top of the screen.
          This helps ensure you don't miss events due to timezone confusion.
        </HelpTopicView>
        <HelpTopicView title={'Announcements'}>
          Important announcements from THO and the TwitarrTeam appear prominently on the Today screen. These may include
          schedule changes, important reminders, or other critical information.
        </HelpTopicView>
        <HelpTopicView title={'Daily Theme'}>
          Most days of the cruise has a theme. The Today screen displays the current day's theme, which may inspire
          costumes, activities, or conversations.
        </HelpTopicView>
        <HelpTopicView title={'Next Appointment'}>
          Your next scheduled event, personal event, or joined LFG will appear on the Today screen, making it easy to
          see what's coming up next in your day.
        </HelpTopicView>
        <HelpTopicView title={'App Updates'}>
          If there's a new version of the app available, you'll see a notification at the bottom of the Today screen
          with information about the update.
        </HelpTopicView>
        <HelpChapterTitleView title={'Header Buttons'} />
        <HelpTopicView title={'Drawer'} icon={AppIcons.drawer}>
          Access the app drawer from the top left corner to find additional features, documentation, and settings.
        </HelpTopicView>
        <HelpTopicView title={'Notifications'} icon={AppIcons.notificationShow}>
          If you're logged in, you'll see a notifications icon in the top right. Tap it to view your notifications and
          alerts.
        </HelpTopicView>
        <HelpTopicView title={'Account Menu'} icon={AppIcons.user}>
          The account menu in the top right corner provides quick access to your profile, account settings, and help
          resources.
        </HelpTopicView>
        <HelpChapterTitleView title={'Pre-Registration Mode'} />
        <HelpTopicView>
          Before the cruise starts, the Today screen will show pre-registration information and features that are
          available before sailing begins.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
