import React from 'react';
import {Text} from 'react-native-paper';

import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {DailyThemeHelpTopicView} from '#src/Components/Views/Help/Common/DailyThemeHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';

export const CruiseHelpScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <HelpChapterTitleView title={'Daily Themes'}>
          <DailyThemeHelpTopicView showTitle={false} />
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Cruise Assistance'}>
          <HelpTopicView title={'At Sea'}>
            Visit the JoCo Cruise Info Desk, typically located in the atrium on deck 1 midship.
          </HelpTopicView>
          <HelpTopicView title={'On Land'}>
            Contact The Home Office via email at{' '}
            <HyperlinkText>
              <Text>info@jococruise.com</Text>
            </HyperlinkText>
          </HelpTopicView>
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
