/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {type Source as FastImageSource} from '@d11/react-native-fast-image';
import {type ImageRequireSource, type TransformsStyle, type View} from 'react-native';
import {type AnimatedRef, type MeasuredDimensions} from 'react-native-reanimated';

import {AppImageMetaData} from '#src/Types/AppImageMetaData';

export type Dimensions = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export type ImageSource = {
  uri: string;
  /**
   * FastImage source. Prefer this over `uri` when rendering: bundled assets
   * must be the original `require()` number on Android Release.
   */
  source: FastImageSource | ImageRequireSource;
  dimensions: Dimensions | null;
  thumbUri: string;
  thumbDimensions: Dimensions | null;
  thumbRect: MeasuredDimensions | null;
  thumbRef?: AnimatedRef<View> | null;
  thumbBorderRadius?: number;
  alt?: string;
  type: 'image' | 'circle-avi' | 'rect-avi';
};

export type LightboxImage = ImageSource & {
  metadata: AppImageMetaData;
};

export type Transform = Exclude<TransformsStyle['transform'], string | undefined>;

export type LightboxTransforms = {
  scaleAndMoveTransform: Transform;
  cropFrameTransform: Transform;
  cropContentTransform: Transform;
  borderRadius: number;
  isResting: boolean;
  isHidden: boolean;
};
