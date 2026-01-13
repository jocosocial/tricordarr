import React from 'react';

import {OobeNoteCard} from '#src/Components/Cards/OobeNoteCard';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ContributorView} from '#src/Components/Views/ContributorView';
import {SourceCodeView} from '#src/Components/Views/SourceCodeView';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import cfry from '#assets/contributors/cfry.jpg';
// @ts-ignore
import gowtam from '#assets/contributors/gowtam.jpg';
// @ts-ignore
import grant from '#assets/contributors/grant.jpg';
// @ts-ignore
import hendu from '#assets/contributors/hendu.jpg';
// @ts-ignore
import tricordarr from '#assets/PlayStore/tricordarr.jpg';

export const AboutTricordarrScreen = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
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
          <ContributorView image={AppImageMetaData.fromAsset(gowtam, 'gowtam.jpg')}>
            Gowtam Lal (@baconmania) brought the day planner to the app and a whole lot of iOS support and general
            improvements. His greatest contribution is the recurring hackathons at the local pub. Turns out friends make
            great beta testers.
          </ContributorView>
          <OobeNoteCard />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Source Code</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <SourceCodeView />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
