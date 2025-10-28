import {ImageStyle as FastImageStyle} from '@d11/react-native-fast-image';
import React, {useState} from 'react';
import {Image, ImageStyle as RNImageStyle, StyleProp, TouchableOpacity, View} from 'react-native';
import {Card} from 'react-native-paper';

import {AppScaledImage} from '#src/Components/Images/AppFastImage';
import {AppImageViewer} from '#src/Components/Images/AppImageViewer';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface AppImageProps {
  style?: StyleProp<FastImageStyle | RNImageStyle>;
  mode?: 'cardcover' | 'image' | 'avatar' | 'scaledimage';
  image: AppImageMetaData;
  disableTouch?: boolean;
  viewerImages?: AppImageMetaData[];
  initialViewerIndex?: number;
  onPress?: () => void;
}

/**
 * AppImage is for displaying an image. Very similar to APIImageV2, but without the API integration.
 * Used for displaying app assets and locally taken image data.
 *
 * This also includes the AppImageViewer which is the "modal" component that appears when
 * you tap on an image that lets you zoom, download, and other stuff. Setting your own onPress
 * effectively disables the image viewer.
 *
 * "Locally taken image data" means image data that came from the camera via a proper dataURI.
 * Examples include PhotostreamImageSelectionView or ContentPostAttachedImage.
 *
 * @param image The APIImageV2Data that feeds this image.
 * @param style Custom style props for the image display component.
 * @param mode Underlying component to use for the image display.
 * @param disableTouch Disable touching the image.
 * @constructor
 */
export const AppImage = ({
  image,
  style,
  mode = 'cardcover',
  disableTouch = false,
  viewerImages = [],
  initialViewerIndex,
  onPress,
}: AppImageProps) => {
  const {commonStyles} = useStyles();
  const [viewerImagesState, setViewerImagesState] = useState<AppImageMetaData[]>(viewerImages);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const handlePress = () => {
    if (viewerImagesState.length === 0) {
      setViewerImagesState([image]);
    }
    setIsViewerVisible(true);
  };

  // @TODO this is all busted
  const imageUriSource = image.dataURI ? {uri: image.dataURI} : {uri: image.fullURI};

  return (
    <View>
      <AppImageViewer
        // @TODO disable downloads because it's all busted
        enableDownload={false}
        viewerImages={viewerImagesState}
        isVisible={isViewerVisible}
        setIsVisible={setIsViewerVisible}
        initialIndex={initialViewerIndex}
      />
      <TouchableOpacity activeOpacity={1} onPress={onPress || handlePress} disabled={disableTouch}>
        {mode === 'cardcover' && <Card.Cover style={style as RNImageStyle} source={imageUriSource} />}
        {mode === 'image' && (
          <Image resizeMode={'cover'} style={[commonStyles.headerImage, style]} source={imageUriSource} />
        )}
        {mode === 'scaledimage' && <AppScaledImage image={imageUriSource} style={style as FastImageStyle} />}
      </TouchableOpacity>
    </View>
  );
};
