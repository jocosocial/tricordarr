import {AppImageViewer} from './AppImageViewer';
import {Image, StyleProp, TouchableOpacity, ImageStyle as RNImageStyle, ImageURISource, View} from 'react-native';
import {ActivityIndicator, Card} from 'react-native-paper';
import React, {useEffect, useState} from 'react';
import {useImageQuery} from '../Queries/ImageQuery';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ImageQueryData} from '../../libraries/Types';
import {AppIcon} from '../Icons/AppIcon';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useFeature} from '../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../libraries/Enums/AppFeatures';
import {useModal} from '../Context/Contexts/ModalContext';
import {HelpModalView} from '../Views/Modals/HelpModalView';
import {AppFastImage} from './AppFastImage.tsx';
import {ImageStyle as FastImageStyle} from 'react-native-fast-image';
import {useConfig} from '../Context/Contexts/ConfigContext.ts';

interface APIImageProps {
  thumbPath: string;
  fullPath: string;
  style?: StyleProp<FastImageStyle | RNImageStyle>;
  mode?: 'cardcover' | 'image' | 'avatar' | 'scaledimage';
}

const animatedRegex = new RegExp('\\.(gif)$', 'i');

/**
 * APIImage is for displaying an image from the Swiftarr API.
 *
 * This also includes the AppImageViewer which is the "modal" component that appears when
 * you tap on an image that lets you zoom, download, and other stuff.
 *
 * This shares a lot with AppImage.tsx and some day will likely be replaced by it.
 * It is separate because we need a lot more logic around dynamically fetching the
 * full size image then showing the AppImageViewer in a single press.
 *
 * @param thumbPath URL path to the thumbnail of the image (ex: '/image/thumb/ABC123.jpg').
 * @param fullPath URL path the full file of the image (ex: '/image/full/ABC123.jpg').
 * @param style Custom style props for the image display component.
 * @param mode Underlying component to use for the image display.
 * @constructor
 */
export const APIImage = ({thumbPath, fullPath, style, mode = 'cardcover'}: APIImageProps) => {
  const {getIsDisabled} = useFeature();
  const {appConfig} = useConfig();
  // The thumbnails Swiftarr generates are not animated.
  const isAnimated = animatedRegex.test(thumbPath);
  const isDisabled = getIsDisabled(SwiftarrFeature.images);
  const thumbImageQuery = useImageQuery(
    isAnimated ? fullPath : thumbPath,
    appConfig.skipThumbnails ? false : !isDisabled,
  );
  const fullImageQuery = useImageQuery(fullPath, appConfig.skipThumbnails ? !isDisabled : false);
  const {commonStyles} = useStyles();
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [enableFullQuery, setEnableFullQuery] = useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const [imageSource, setImageSource] = useState<ImageURISource>();

  const handleThumbPress = () => {
    if (fullImageQuery.data) {
      setEnableFullQuery(true);
      return;
    }
    fullImageQuery.refetch().then(() => {
      setEnableFullQuery(true);
    });
  };

  useEffect(() => {
    if (enableFullQuery && fullImageQuery.data) {
      setViewerImages([fullImageQuery.data]);
      setIsViewerVisible(true);
      setEnableFullQuery(false);
    }
  }, [enableFullQuery, fullImageQuery.data]);

  const handleDisableModal = () => {
    setModalContent(
      <HelpModalView
        text={[
          'Images have been disabled by the server admins. This could be for all clients or just Tricordarr. Check the forums, announcements, or Info Desk for more details.',
        ]}
      />,
    );
    setModalVisible(true);
  };

  useEffect(() => {
    if (fullImageQuery.data) {
      setImageSource({uri: fullImageQuery.data.dataURI});
    } else if (thumbImageQuery.data) {
      setImageSource({uri: thumbImageQuery.data.dataURI});
    }
  }, [fullImageQuery.data, thumbImageQuery.data]);

  if (isDisabled) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <AppIcon icon={AppIcons.imageDisabled} onPress={handleDisableModal} />
      </Card.Content>
    );
  }

  if (
    (appConfig.skipThumbnails && (fullImageQuery.isFetching || fullImageQuery.isRefetching)) ||
    (!appConfig.skipThumbnails &&
      (thumbImageQuery.isLoading ||
        thumbImageQuery.isFetching ||
        fullImageQuery.isFetching ||
        fullImageQuery.isRefetching))
  ) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <ActivityIndicator />
      </Card.Content>
    );
  }

  if (!imageSource) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <AppIcon icon={AppIcons.error} />
      </Card.Content>
    );
  }

  return (
    <View>
      <AppImageViewer viewerImages={viewerImages} isVisible={isViewerVisible} setIsVisible={setIsViewerVisible} />
      <TouchableOpacity onPress={handleThumbPress}>
        {mode === 'cardcover' && <Card.Cover style={style as RNImageStyle} source={imageSource} />}
        {mode === 'image' && (
          <Image resizeMode={'cover'} style={[commonStyles.headerImage, style]} source={imageSource} />
        )}
        {mode === 'scaledimage' && <AppFastImage image={imageSource} style={style as FastImageStyle} />}
      </TouchableOpacity>
    </View>
  );
};
