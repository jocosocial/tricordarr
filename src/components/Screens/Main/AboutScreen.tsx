import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Card, DataTable, Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
// @ts-ignore
import grant from '../../../../assets/contributors/grant.jpg';
// @ts-ignore
import hendu from '../../../../assets/contributors/hendu.jpg';
// @ts-ignore
import cfry from '../../../../assets/contributors/cfry.jpg';
// @ts-ignore
import tricordarr from '../../../../assets/PlayStore/tricordarr.jpg';
import {ContributorCard} from '../../Cards/ContributorCard';
import {HyperlinkText} from '../../Text/HyperlinkText';
import {View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {OobeNoteCard} from '../../Cards/OobeNoteCard.tsx';

export const AboutScreen = () => {
  const {commonStyles} = useStyles();
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'titleLarge'} style={commonStyles.marginBottomSmall}>
            Version
          </Text>
          <Card>
            <Card.Content>
              <DataTable>
                <DataTable.Row>
                  <DataTable.Cell>App Version</DataTable.Cell>
                  <DataTable.Cell>{DeviceInfo.getVersion()}</DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Build</DataTable.Cell>
                  <DataTable.Cell>{DeviceInfo.getBuildNumber()}</DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>Android</DataTable.Cell>
                  <DataTable.Cell>{DeviceInfo.getSystemVersion()}</DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </Card.Content>
          </Card>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleLarge'} style={commonStyles.marginBottomSmall}>
            Background
          </Text>
          <ContributorCard
            imageSource={tricordarr}
            bodyText={
              'Tricordarr started as a proof-of-concept in the weeks before JoCo Cruise 2023 and evolved into a fully-featured showcase project for JoCo Cruise 2024. It is proof that any idea can become a reality with determination, vision, an AI co-pilot, and a seemingly unlimited supply of time.'
            }
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleLarge'} style={commonStyles.marginBottomSmall}>
            Contributors
          </Text>
          <ContributorCard
            imageSource={grant}
            bodyText={
              "Grant Cohoe (@grant) is the primary developer of this app. If you're looking for someone to shout at, it's him."
            }
          />
          <ContributorCard
            imageSource={hendu}
            bodyText={
              'Dustin Hendrickson (@hendu) contributed the fantastic built-in webview integration, many bug fixes, and plenty of PR tests & reviews.'
            }
          />
          <ContributorCard
            imageSource={cfry}
            bodyText={
              'Chall Fry (@cfry) is the lead architect of the Twitarr service and the iOS app The Kraken. His guidance and insight on software engineering and the mobile app world has been invaluable. He also made the cool lighter video.'
            }
          />
          <OobeNoteCard />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleLarge'} style={commonStyles.marginBottomSmall}>
            Source Code
          </Text>
          <View style={commonStyles.marginBottomSmall}>
            <HyperlinkText>
              <>
                <Text>Tricordarr (this mobile app)</Text>
                <Text>https://github.com/jocosocial/tricordarr</Text>
              </>
            </HyperlinkText>
          </View>
          <View style={commonStyles.marginBottomSmall}>
            <HyperlinkText>
              <>
                <Text>Swiftarr (the server)</Text>
                <Text>https://github.com/jocosocial/swiftarr</Text>
              </>
            </HyperlinkText>
          </View>
          <View style={commonStyles.marginBottomSmall}>
            <Text>
              Keep in touch with us on the JoCo Cruise Discord in #twitarr! We're always looking for new contributors!
            </Text>
          </View>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
