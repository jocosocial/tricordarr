import React, {useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {Card} from 'react-native-paper';

import {AppImageViewer} from '#src/Components/Images/AppImageViewer';
import {APIImageV2Data} from '#src/Types/APIImageV2Data';

// @ts-ignore
import AllImage from '#assets/easteregg_all.jpg';

/**
 * Display a pretty image in the app based on the time of day.
 */
export const EasterEggImageCardCover = () => {
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  let sourceImage = AllImage;
  let viewerIndex = 0;

  const viewerImages: APIImageV2Data[] = [APIImageV2Data.fromURI(Image.resolveAssetSource(AllImage).uri)];

  return (
    <View>
      <AppImageViewer
        viewerImages={viewerImages}
        isVisible={isViewerVisible}
        setIsVisible={setIsViewerVisible}
        initialIndex={viewerIndex}
      />
      <TouchableOpacity onPress={() => setIsViewerVisible(true)}>
        <Card.Cover source={sourceImage} />
      </TouchableOpacity>
    </View>
  );
};
