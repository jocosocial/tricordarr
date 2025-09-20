import {AppImageViewer} from './AppImageViewer.tsx';
import {Image, StyleProp, TouchableOpacity, ImageStyle as RNImageStyle, View, ImageURISource} from 'react-native';
import {Card} from 'react-native-paper';
import React, {useState} from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {ImageQueryData} from '#src/Libraries/Types/index.ts';
import {AppFastImage} from './AppFastImage.tsx';
import {ImageStyle as FastImageStyle} from 'react-native-fast-image';

interface AppImageProps {
  style?: StyleProp<FastImageStyle | RNImageStyle>;
  mode?: 'cardcover' | 'image' | 'avatar' | 'scaledimage';
  image: ImageQueryData;
  disableTouch?: boolean;
}

/**
 * AppImage is for displaying an image.
 *
 * This also includes the AppImageViewer which is the "modal" component that appears when
 * you tap on an image that lets you zoom, download, and other stuff.
 *
 * @param image The ImageQueryData that feeds this image.
 * @param style Custom style props for the image display component.
 * @param mode Underlying component to use for the image display.
 * @param disableTouch Disable touching the image.
 * @constructor
 */
export const AppImage = ({image, style, mode = 'cardcover', disableTouch = false}: AppImageProps) => {
  const {commonStyles} = useStyles();
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const handlePress = () => {
    setViewerImages([image]);
    setIsViewerVisible(true);
  };

  const imageUriSource: ImageURISource = {uri: image.dataURI};

  return (
    <View>
      <AppImageViewer viewerImages={viewerImages} isVisible={isViewerVisible} setIsVisible={setIsViewerVisible} />
      <TouchableOpacity activeOpacity={1} onPress={handlePress} disabled={disableTouch}>
        {mode === 'cardcover' && <Card.Cover style={style as RNImageStyle} source={imageUriSource} />}
        {mode === 'image' && (
          <Image resizeMode={'cover'} style={[commonStyles.headerImage, style]} source={imageUriSource} />
        )}
        {mode === 'scaledimage' && <AppFastImage image={imageUriSource} style={style as FastImageStyle} />}
      </TouchableOpacity>
    </View>
  );
};
