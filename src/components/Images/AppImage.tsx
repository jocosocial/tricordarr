import {AppImageViewer} from './AppImageViewer';
import {Image, StyleProp, TouchableOpacity, ImageStyle as RNImageStyle, View, ImageURISource} from 'react-native';
import {Card} from 'react-native-paper';
import React, {useState} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ImageQueryData} from '../../libraries/Types';
import {AppFastImage} from './AppFastImage.tsx';
import {ImageStyle as FastImageStyle} from 'react-native-fast-image';

interface AppImageProps {
  style?: StyleProp<FastImageStyle | RNImageStyle>;
  mode?: 'cardcover' | 'image' | 'avatar' | 'scaledimage';
  image: ImageQueryData;
}

/**
 * AppImage is for displaying an image.
 *
 * This also includes the AppImageViewer which is the "modal" component that appears when
 * you tap on an image that lets you zoom, download, and other stuff.
 *
 * @param style Custom style props for the image display component.
 * @param mode Underlying component to use for the image display.
 * @constructor
 */
export const AppImage = ({image, style, mode = 'cardcover'}: AppImageProps) => {
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
      <TouchableOpacity onPress={handlePress}>
        {mode === 'cardcover' && <Card.Cover style={style as RNImageStyle} source={imageUriSource} />}
        {mode === 'image' && (
          <Image resizeMode={'cover'} style={[commonStyles.headerImage, style]} source={imageUriSource} />
        )}
        {mode === 'scaledimage' && <AppFastImage image={imageUriSource} style={style as FastImageStyle} />}
      </TouchableOpacity>
    </View>
  );
};
