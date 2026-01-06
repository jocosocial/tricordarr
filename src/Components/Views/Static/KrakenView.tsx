import React from 'react';
import {Linking, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ContributorView} from '#src/Components/Views/ContributorView';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import Krakn from '#assets/Krakn.png';

export const KrakenView = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text>
            This feature is not available and/or disabled in this app. Since you have an iPhone, you can use The Kraken
            app to access it instead!
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://apps.apple.com/us/app/the-kraken-a-twitarr-client/id1496322373')}>
            <ContributorView image={AppImageMetaData.fromAsset(Krakn, 'Krakn.png')}>
              The Kraken is a social media app custom-built for JoCo Cruise by Chall Fry.
            </ContributorView>
          </TouchableOpacity>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
