import React from 'react';
import {View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Card, DataTable, Text} from 'react-native-paper';

import {ContributorCard} from '#src/Components/Cards/ContributorCard';
import {OobeNoteCard} from '#src/Components/Cards/OobeNoteCard';
import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import cfry from '#assets/contributors/cfry.jpg';
// @ts-ignore
import grant from '#assets/contributors/grant.jpg';
// @ts-ignore
import hendu from '#assets/contributors/hendu.jpg';
// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

export const AboutTricordarrScreen = () => {
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
                  <DataTable.Cell>OS Version</DataTable.Cell>
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
            image={AppImageMetaData.fromAsset(tricordarr, 'tricordarr.jpg')}
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
            image={AppImageMetaData.fromAsset(grant, 'grant.jpg')}
            bodyText={
              "Grant Cohoe (@grant) is the primary developer of this app. If you're looking for someone to shout at, it's him."
            }
          />
          <ContributorCard
            image={AppImageMetaData.fromAsset(hendu, 'hendu.jpg')}
            bodyText={
              'Dustin Hendrickson (@hendu) contributed the fantastic built-in webview integration, many bug fixes, and plenty of PR tests & reviews.'
            }
          />
          <ContributorCard
            image={AppImageMetaData.fromAsset(cfry, 'cfry.jpg')}
            bodyText={
              'Chall Fry (@cfry) is the lead architect of the Twitarr service and the iOS app The Kraken. His guidance and insight on software engineering and the mobile app world has been invaluable. He made the cool lighter video and PhotoStream processing library.'
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
