import React, {useEffect, useState} from 'react';
import {Image, ImageURISource, StyleProp, StyleSheet} from 'react-native';
import {ActivityIndicator, Card} from 'react-native-paper';
import FastImage, {ImageStyle} from 'react-native-fast-image';
import {useStyles} from '../Context/Contexts/StyleContext.ts';

interface ImageDimensionProps {
  width?: number;
  height?: number;
}

interface AppFastImageProps {
  image: ImageURISource;
  style?: StyleProp<ImageStyle>;
}

/**
 * Displays an image using FastImage which seems to work for dynamically sized images.
 * I found that this lets me display an image at 100% width and a height that is proportional
 * to the original image. Haven't tried to see if this pattern can be modified to use the regular
 * RN Image component. But also at this point, I don't care. It works.
 *
 * This has some overlap and origin in MapScreen.tsx where it was used to display the ship map.
 * Maybe dedupe with that some day?
 * @param image The image data to render in the form of {uri: 'data_uri_here'}
 * @param style Optional styling for the image.
 * @constructor
 */
export const AppFastImage = ({image, style}: AppFastImageProps) => {
  const [imageSize, setImageSize] = useState<ImageDimensionProps>({width: undefined, height: undefined});
  const {commonStyles} = useStyles();

  // ChatGPT had the idea to load this from the image and store it in state.
  useEffect(() => {
    if (image.uri) {
      Image.getSize(image.uri, (width, height) => {
        setImageSize({width: width, height: height});
      });
    }
  }, [image.uri]);

  // 0 / 0 by default is NaN which produces very funky not helpful errors.
  if (!imageSize.width || !imageSize.height || !image.uri) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <ActivityIndicator />
      </Card.Content>
    );
  }

  // https://stackoverflow.com/questions/36436913/image-contain-resizemode-not-working-in-react-native
  const styles = StyleSheet.create({
    image: {
      flex: 1,
      height: undefined,
      width: undefined,
      aspectRatio: imageSize.width / imageSize.height,
    },
  });

  return <FastImage style={[styles.image, style]} source={{uri: image.uri}} />;
};
