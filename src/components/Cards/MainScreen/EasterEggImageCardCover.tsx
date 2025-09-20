import {Card} from 'react-native-paper';
import React, {useState} from 'react';
// @ts-ignore
import AllImage from '../../../../assets/easteregg_all.jpg';
import {Image, TouchableOpacity, View} from 'react-native';
import {AppImageViewer} from '../../Images/AppImageViewer';
import {ImageQueryData} from '../../../Libraries/Types';
import {encode as base64_encode} from 'base-64';

/**
 * Display a pretty image in the app based on the time of day.
 */
export const EasterEggImageCardCover = () => {
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  let sourceImage = AllImage;
  let viewerIndex = 0;

  const viewerImages: ImageQueryData[] = [
    {
      dataURI: Image.resolveAssetSource(AllImage).uri,
      mimeType: 'image/jpeg',
      fileName: 'EasterEggAllImage.jpg',
      base64: base64_encode(AllImage),
    },
  ];

  // Have to disable download since loading static images is actually really hard and I don't feel
  // like figuring it out right now.
  // https://javascript.plainenglish.io/using-images-in-react-native-668e3a835858
  return (
    <View>
      <AppImageViewer
        viewerImages={viewerImages}
        isVisible={isViewerVisible}
        setIsVisible={setIsViewerVisible}
        enableDownload={false}
        initialIndex={viewerIndex}
      />
      <TouchableOpacity onPress={() => setIsViewerVisible(true)}>
        <Card.Cover source={sourceImage} />
      </TouchableOpacity>
    </View>
  );
};
