import FastImage, {ImageStyle as FastImageStyle, OnErrorEvent, OnProgressEvent} from '@d11/react-native-fast-image';
import React from 'react';
import {useCallback, useState} from 'react';
import {type ImageStyle as RNImageStyle, StyleProp, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Card} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppScaledImage} from '#src/Components/Images/AppFastImage';
import {AppImageViewer} from '#src/Components/Images/AppImageViewer';
import {HelpModalView} from '#src/Components/Views/Modals/HelpModalView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {APIImageSizePaths, APIImageV2Data} from '#src/Types';

interface APIImageV2Props {
  path: string;
  style?: StyleProp<FastImageStyle | RNImageStyle>;
  mode?: 'cardcover' | 'image' | 'avatar' | 'scaledimage';
  disableTouch?: boolean;
  initialSize?: keyof typeof APIImageSizePaths;
}

/**
 * Displays an Image from the Swiftarr API. This will properly handle itself if the Images
 * feature is disabled. It will also include an image viewer that allows the user to see
 * the image in more detail.
 */
export const APIImageV2 = ({path, style, mode, disableTouch, initialSize}: APIImageV2Props) => {
  const [viewerImages, setViewerImages] = useState<APIImageV2Data[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const {commonStyles} = useStyles();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.images);
  const {setModalContent, setModalVisible} = useModal();
  const {appConfig} = useConfig();
  const [imageSourceMetadata, setImageSourceMetadata] = useState<APIImageV2Data>(
    APIImageV2Data.fromFileName(path, appConfig),
  );
  const {setErrorBanner} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();

  const styles = StyleSheet.create({
    disabledCard: {
      ...commonStyles.marginVerticalSmall,
    },
    image: {
      ...commonStyles.headerImage,
      ...style,
    },
  });

  /**
   * Callback that fires when the image is successfully loaded. This will give information
   * to the image viewer.
   */
  const onLoad = useCallback(() => {
    setViewerImages([imageSourceMetadata]);
  }, [imageSourceMetadata]);

  /**
   * Callback that fires when the image is pressed. In our case this opens the image viewer.
   */
  const onPress = useCallback(() => {
    if (viewerImages.length !== 0) {
      setIsViewerVisible(true);
      return;
    }
    setErrorBanner('Error loading image');
  }, [setIsViewerVisible, setErrorBanner, viewerImages]);

  /**
   * Callback that fires when the image fails to load. This will display an error message
   * in the snackbar.
   */
  const onError = useCallback(
    (event: OnErrorEvent) => {
      setSnackbarPayload({message: String(event.nativeEvent.error), messageType: 'error'});
    },
    [setSnackbarPayload],
  );

  /**
   * Callback that fires when the image is loading. At least theoretically. When
   * testing in low network conditions nothing happened. EDGE might have been too low.
   */
  const onProgress = useCallback((event: OnProgressEvent) => {
    console.log('onProgress', event.nativeEvent.loaded, event.nativeEvent.total);
  }, []);

  /**
   * Callback to show the disabled modal if we need to do that. See below.
   */
  const handleDisableModal = useCallback(() => {
    setModalContent(
      <HelpModalView
        text={[
          'Images have been disabled by the server admins. This could be for all clients or just Tricordarr. Check the forums, announcements, or Info Desk for more details.',
        ]}
      />,
    );
    setModalVisible(true);
  }, [setModalContent, setModalVisible]);

  /**
   * Effect to set the image source metadata on mount.This is used to display the image in
   * the image viewer and what to show in the underlying image component.
   */
  React.useEffect(() => {
    setImageSourceMetadata(APIImageV2Data.fromFileName(path, appConfig));
  }, [path, appConfig]);

  /**
   * Effect to preload the full image if the initial size is set to thumb.
   * That gets handled under the hood by the FastImage component.
   */
  React.useEffect(() => {
    if (initialSize === 'thumb') {
      FastImage.preload([{uri: imageSourceMetadata.fullURI, priority: FastImage.priority.low}]);
    }
  }, [initialSize, imageSourceMetadata.fullURI]);

  /**
   * If the Images feature of Swiftarr is disabled, then show a generic disabled icon.
   */
  if (isDisabled) {
    return (
      <Card.Content style={styles.disabledCard}>
        <AppIcon icon={AppIcons.imageDisabled} onPress={handleDisableModal} />
      </Card.Content>
    );
  }

  const imageSource = {uri: initialSize === 'full' ? imageSourceMetadata.fullURI : imageSourceMetadata.thumbURI};

  return (
    <View>
      <AppImageViewer viewerImages={viewerImages} isVisible={isViewerVisible} setIsVisible={setIsViewerVisible} />
      <TouchableOpacity disabled={disableTouch} activeOpacity={1} onPress={onPress}>
        {/* {mode === 'cardcover' && (
          <Card.Cover style={style as RNImageStyle} source={ImageQueryData.toImageSource(imageQueryData)} />
        )} */}
        {mode === 'image' && (
          <FastImage
            resizeMode={'cover'}
            style={styles.image}
            source={imageSource}
            onLoad={onLoad}
            onError={onError}
            onProgress={onProgress}
          />
        )}
        {mode === 'scaledimage' && (
          <AppScaledImage
            image={imageSource}
            style={style as FastImageStyle}
            onLoad={onLoad}
            onError={onError}
            onProgress={onProgress}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};
