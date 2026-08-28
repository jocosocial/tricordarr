// default implementation fallback for web

import {memo} from 'react';
import {View} from 'react-native';
import {Gesture} from 'react-native-gesture-handler';
import {type SharedValue} from 'react-native-reanimated';

import {
  type Dimensions as ImageDimensions,
  type ImageSource,
  type LightboxTransforms,
} from '#src/Components/Lightbox/types';

type Props = {
  imageSrc: ImageSource;
  onRequestClose: () => void;
  onTap: () => void;
  onZoom: (scaled: boolean) => void;
  onLoad: (dims: ImageDimensions) => void;
  isPagerDragging: SharedValue<boolean>;
  measureSafeArea: () => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imageAspect: number | undefined;
  imageDimensions: ImageDimensions | undefined;
  dismissSwipePan: ReturnType<typeof Gesture.Pan>;
  transforms: Readonly<SharedValue<LightboxTransforms>>;
};

const ImageItem = (_props: Props) => {
  return <View />;
};

export default memo(ImageItem);
