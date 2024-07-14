import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import {ActivityIndicator, Card} from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import {useStyles} from '../Context/Contexts/StyleContext.ts';

interface ImageDimensionProps {
  width?: number;
  height?: number;
}

export const APIFastImage = ({image}: {image: {uri: string}}) => {
  const [imageSize, setImageSize] = useState<ImageDimensionProps>({width: undefined, height: undefined});
  const {commonStyles} = useStyles();

  // ChatGPT had the idea to load this from the image and store it in state.
  useEffect(() => {
    Image.getSize(image.uri, (width, height) => {
      setImageSize({width: width, height: height});
    });
  }, [image.uri]);

  // 0 / 0 by default is NaN which produces very funky not helpful errors.
  if (!imageSize.width || !imageSize.height) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <ActivityIndicator />
      </Card.Content>
    );
  }

  // https://stackoverflow.com/questions/36436913/image-contain-resizemode-not-working-in-react-native
  const styles = {
    image: {
      flex: 1,
      height: undefined,
      width: undefined,
      aspectRatio: imageSize.width / imageSize.height,
    },
  };

  return <FastImage style={styles.image} source={{uri: image.uri}} />;
};
