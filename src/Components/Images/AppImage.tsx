import {ImageStyle as FastImageStyle} from '@d11/react-native-fast-image';
import React, {useState} from 'react';
import {Image, ImageStyle as RNImageStyle, StyleProp, TouchableOpacity, View} from 'react-native';
import {Card} from 'react-native-paper';

import {AppScaledImage} from '#src/Components/Images/AppFastImage';
import {AppImageViewer} from '#src/Components/Images/AppImageViewer';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {APIImageV2Data} from '#src/Types';

interface AppImageProps {
  style?: StyleProp<FastImageStyle | RNImageStyle>;
  mode?: 'cardcover' | 'image' | 'avatar' | 'scaledimage';
  image: APIImageV2Data;
  disableTouch?: boolean;
}

/**
 * AppImage is for displaying an image. Very similar to APIImageV2, but without the API integration.
 *
 * This also includes the AppImageViewer which is the "modal" component that appears when
 * you tap on an image that lets you zoom, download, and other stuff.
 *
 * @param image The APIImageV2Data that feeds this image.
 * @param style Custom style props for the image display component.
 * @param mode Underlying component to use for the image display.
 * @param disableTouch Disable touching the image.
 * @constructor
 */
export const AppImage = ({image, style, mode = 'cardcover', disableTouch = false}: AppImageProps) => {
  const {commonStyles} = useStyles();
  const [viewerImages, setViewerImages] = useState<APIImageV2Data[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const handlePress = () => {
    setViewerImages([image]);
    setIsViewerVisible(true);
  };

  const imageUriSource = {uri: image.fullURI};

  return (
    <View>
      <AppImageViewer viewerImages={viewerImages} isVisible={isViewerVisible} setIsVisible={setIsViewerVisible} />
      <TouchableOpacity activeOpacity={1} onPress={handlePress} disabled={disableTouch}>
        {mode === 'cardcover' && <Card.Cover style={style as RNImageStyle} source={imageUriSource} />}
        {mode === 'image' && (
          <Image resizeMode={'cover'} style={[commonStyles.headerImage, style]} source={imageUriSource} />
        )}
        {mode === 'scaledimage' && <AppScaledImage image={imageUriSource} style={style as FastImageStyle} />}
      </TouchableOpacity>
    </View>
  );
};
