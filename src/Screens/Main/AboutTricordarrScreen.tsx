import React from 'react';
import DeviceInfo from 'react-native-device-info';

import {OobeNoteCard} from '#src/Components/Cards/OobeNoteCard';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ContributorView} from '#src/Components/Views/ContributorView';
import {SourceCodeView} from '#src/Components/Views/SourceCodeView';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
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
  const commonNavigation = useCommonStack();
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Version</ListSubheader>
        </ListSection>
        <DataFieldListItem title={'App Version'} description={DeviceInfo.getVersion()} />
        <DataFieldListItem title={'Build'} description={DeviceInfo.getBuildNumber()} />
        <DataFieldListItem title={'System Version'} description={DeviceInfo.getSystemVersion()} />
        <ListSection>
          <ListSubheader>Background</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <ContributorView image={AppImageMetaData.fromAsset(tricordarr, 'tricordarr.jpg')}>
            Tricordarr started as a proof-of-concept in the weeks before JoCo Cruise 2023 and evolved into a
            fully-featured showcase project for JoCo Cruise 2024. It is proof that any idea can become a reality with
            determination, vision, an AI co-pilot, and a seemingly unlimited supply of time.
          </ContributorView>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Contributors</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <ContributorView image={AppImageMetaData.fromAsset(grant, 'grant.jpg')}>
            Grant Cohoe (@grant) is the primary developer of this app. If you're looking for someone to shout at, it's
            him.
          </ContributorView>
          <ContributorView image={AppImageMetaData.fromAsset(hendu, 'hendu.jpg')}>
            Dustin Hendrickson (@hendu) contributed the fantastic built-in webview integration, many bug fixes, and
            plenty of PR tests & reviews.
          </ContributorView>
          <ContributorView image={AppImageMetaData.fromAsset(cfry, 'cfry.jpg')}>
            Chall Fry (@cfry) is the lead architect of the Twitarr service and the iOS app The Kraken. His guidance and
            insight on software engineering and the mobile app world has been invaluable. He made the cool lighter video
            and most of the native-side code.
          </ContributorView>
          <OobeNoteCard />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Source Code</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <SourceCodeView />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Privacy</ListSubheader>
        </ListSection>
        <DataFieldListItem
          title={'Privacy Policy'}
          description={'View the service and app privacy policies.'}
          onPress={() => commonNavigation.push(CommonStackComponents.privacyScreen)}
        />
      </ScrollingContentView>
    </AppView>
  );
};
