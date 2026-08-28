import FastImage, {ImageStyle as FastImageStyle} from '@d11/react-native-fast-image';
import React from 'react';
import {Image, ImageStyle as RNImageStyle, StyleProp, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Card} from 'react-native-paper';
import {useAnimatedRef} from 'react-native-reanimated';

import {AppScaledImage} from '#src/Components/Images/AppScaledImage';
import {useLightboxControls} from '#src/Components/Lightbox/state';
import {toLightboxImage} from '#src/Components/Lightbox/toLightboxImage';
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
 * AppImage is for displaying an image. Very similar to APIImage, but without the API integration.
 * Used for displaying app assets and locally taken image data.
 *
 * Tapping the image opens the global Lightbox unless `onPress` is provided, which
 * takes over the press handler and skips the viewer.
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
  const {openLightbox} = useLightboxControls();
  const thumbRef = useAnimatedRef<View>();

  const handlePress = () => {
    const images = (viewerImages.length === 0 ? [image] : viewerImages).map((metadata, i) =>
      toLightboxImage(metadata, i === (initialViewerIndex ?? 0) ? {thumbRef} : {}),
    );
    openLightbox({
      images,
      index: initialViewerIndex ?? 0,
    });
  };

  // Prefer the require() source for bundled assets. On Android Release,
  // resolveAssetSource() returns a scheme-less drawable name that RN Image
  // accepts as a resource, but require() is the supported API.
  const imageSource = image.assetSource ?? {uri: AppImageMetaData.getSourceURI(image)};
  const imageUriSource = {uri: AppImageMetaData.getSourceURI(image)};

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress || handlePress} disabled={disableTouch}>
      <View ref={thumbRef} collapsable={false}>
        {mode === 'cardcover' && <Card.Cover style={style as RNImageStyle} source={imageSource} />}
        {mode === 'image' && (
          <Image
            resizeMode={'cover'}
            style={StyleSheet.flatten([commonStyles.headerImage, style]) as RNImageStyle}
            source={imageSource}
          />
        )}
        {mode === 'scaledimage' &&
          (image.assetSource && image.assetWidth && image.assetHeight ? (
            <FastImage
              source={image.assetSource}
              style={[assetScaledImageStyles(image.assetWidth, image.assetHeight).image, style as FastImageStyle]}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : (
            <AppScaledImage image={imageUriSource} style={style as FastImageStyle} />
          ))}
      </View>
    </TouchableOpacity>
  );
};

const assetScaledImageStyles = (width: number, height: number) =>
  StyleSheet.create({
    image: {
      flex: 1,
      height: undefined,
      width: undefined,
      aspectRatio: width / height,
    },
  });
