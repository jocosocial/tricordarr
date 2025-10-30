import React from 'react';
import {Linking, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';

import {ContributorCard} from '#src/Components/Cards/ContributorCard';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import Krakn from '#assets/Krakn.png';

export const KrakenView = () => {
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text>
            This feature is not available in this app. Since you have an iPhone, you can use The Kraken app to access it
            instead!
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://apps.apple.com/us/app/the-kraken-a-twitarr-client/id1496322373')}>
            <ContributorCard
              image={AppImageMetaData.fromAsset(Krakn, 'Krakn.png')}
              bodyText={
                "The Kraken is a social media app custom-built for JoCo Cruise. If you're coming with us on the cruise, you want to have this app installed to maximize your experience."
              }
            />
          </TouchableOpacity>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
