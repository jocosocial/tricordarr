import React from 'react';
import {Card, Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HelpButtonHelpTopicView} from '#src/Components/Views/Help/Common/HelpButtonHelpTopicView';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const KrakenTalkHelpScreen = () => {
  const {commonStyles} = useStyles();

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <HelpChapterTitleView title={'General'}>
          <PaddedContentView padTop={false}>
            <Card style={commonStyles.twitarrNegative}>
              <Card.Title
                title={'Warning: This is janky AF'}
                titleStyle={[commonStyles.onTwitarrButton, commonStyles.bold]}
                subtitleVariant={'bodyLarge'}
                subtitleStyle={[commonStyles.onTwitarrButton]}
              />
              <Card.Content>
                <Text style={[commonStyles.onTwitarrButton]}>
                  KrakenTalk in Tricordarr is EXTREMELY experimental. iOS users will likely have better luck with The
                  Kraken app. Do NOT even think about using it during an emergency.
                </Text>
              </Card.Content>
            </Card>
          </PaddedContentView>
          <HelpTopicView>
            It's kind of like Twitch.com, except audio-only and you can talk with the streamer in real time. Oh, and the
            streamer can only stream to one person at a time, which makes them sort of like a 'caller'.
          </HelpTopicView>
          <HelpTopicView>Put another way: on-board WiFi calling via Twitarr.</HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Restrictions'}>
          <HelpTopicView>
            You can only call users who have favorited you. Favoriting them allows them to call you.
          </HelpTopicView>
          <HelpTopicView>
            The person you are calling must have either Tricordarr or The Kraken running on their device and it must be
            actively connected to WiFi.
          </HelpTopicView>
        </HelpChapterTitleView>
        <HelpChapterTitleView title={'Actions'}>
          <HelpButtonHelpTopicView />
        </HelpChapterTitleView>
      </ScrollingContentView>
    </AppView>
  );
};
