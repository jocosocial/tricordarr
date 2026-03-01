import FastImage, {ImageStyle as FastImageStyle, OnErrorEvent, OnProgressEvent} from '@d11/react-native-fast-image';
import {type Source as FastImageSource} from '@d11/react-native-fast-image';
import React from 'react';
import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  type ImageStyle as RNImageStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Card} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppImageViewer} from '#src/Components/Images/AppImageViewer';
import {AppScaledImage} from '#src/Components/Images/AppScaledImage';
import {HelpModalView} from '#src/Components/Views/Modals/HelpModalView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {createLogger} from '#src/Libraries/Logger';
import {APIImageSizePaths} from '#src/Types/AppImageMetaData';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

const logger = createLogger('APIImage.tsx');

interface APIImageV2Props {
  path: string;
  style?: StyleProp<FastImageStyle | RNImageStyle>;
  mode?: 'cardcover' | 'image' | 'avatar' | 'scaledimage';
  disableTouch?: boolean;
  staticSize?: keyof typeof APIImageSizePaths;
  onPress?: () => void;
  /**
   * Size for avatar mode. Defaults to styleDefaults.avatarSize.
   */
  size?: number;
}

/**
 * Displays an Image from the Swiftarr API. This will properly handle itself if the Images
 * feature is disabled. It will also include an image viewer that allows the user to see
 * the image in more detail.
 *
 * Setting your own onPress effectively disables the image viewer.
 */
export const APIImage = ({
  path,
  style,
  mode = 'scaledimage',
  disableTouch,
  staticSize,
  onPress,
  size,
}: APIImageV2Props) => {
  const [viewerImages, setViewerImages] = useState<AppImageMetaData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const {commonStyles, styleDefaults} = useStyles();
  const avatarSize = size ?? styleDefaults.avatarSize;
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.images);
  const {setModalContent, setModalVisible} = useModal();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const [imageSourceMetadata, setImageSourceMetadata] = useState<AppImageMetaData>(
    staticSize === 'identicon'
      ? AppImageMetaData.fromIdenticon(path, appConfig, serverUrl)
      : AppImageMetaData.fromFileName(path, appConfig, serverUrl),
  );
  const {setErrorBanner} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();
  const [imageSource, setImageSource] = useState<FastImageSource | undefined>(undefined);
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    disabledCard: {
      ...commonStyles.marginVerticalSmall,
    },
    image: {
      ...commonStyles.headerImage,
      ...style,
    },
    loadingCard: {
      ...commonStyles.marginVerticalSmall,
    },
    imageContainer: {
      position: 'relative',
    },
    imageDebugIcon: {
      position: 'absolute',
      top: 4,
      left: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 12,
      padding: 4,
      zIndex: 1,
    },
    cardCover: {
      height: 195,
      ...commonStyles.fullWidth,
      ...commonStyles.roundedBorderCard,
      overflow: 'hidden',
    },
    avatar: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
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
  const onPressDefault = useCallback(() => {
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
      const message = String(event.nativeEvent.error);
      // Native image load cancellation (e.g. scroll/cell reuse) should not surface as user error.
      const isCancellation = /cancell(ed|ation)/i.test(message) || /operation cancelled/i.test(message);
      if (!isCancellation) {
        setSnackbarPayload({message, messageType: 'error'});
      }
    },
    [setSnackbarPayload],
  );

  /**
   * Callback that fires when the image is loading. At least theoretically. When
   * testing in low network conditions nothing happened. EDGE might have been too low.
   */
  const onProgress = useCallback((event: OnProgressEvent) => {
    logger.debug('onProgress', event.nativeEvent.loaded, event.nativeEvent.total);
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
   * Effect to set the image source metadata on mount. This is used to display the image in
   * the image viewer and what to show in the underlying image component.
   */
  React.useEffect(() => {
    setImageSourceMetadata(
      staticSize === 'identicon'
        ? AppImageMetaData.fromIdenticon(path, appConfig, serverUrl)
        : AppImageMetaData.fromFileName(path, appConfig, serverUrl),
    );
  }, [path, appConfig, serverUrl, staticSize]);

  /**
   * Effect to preload the full image if the initial size is set to thumb.
   * That gets handled under the hood by the FastImage component.
   */
  React.useEffect(() => {
    if (staticSize === 'thumb' && imageSourceMetadata.fullURI) {
      FastImage.preload([{uri: imageSourceMetadata.fullURI, priority: FastImage.priority.low}]);
    }
  }, [staticSize, imageSourceMetadata.fullURI]);

  /**
   * Sets the image source to the appropriate URI based on the initial size.
   * Soon to also include if we have a cache path for the full size!
   */
  React.useEffect(() => {
    if (staticSize === 'thumb') {
      if (!imageSourceMetadata.thumbURI) {
        return;
      }
      const thumbSource = {uri: imageSourceMetadata.thumbURI};
      setImageSource(thumbSource);
      return;
    }
    if (staticSize === 'identicon') {
      if (!imageSourceMetadata.identiconURI) {
        return;
      }
      const identiconSource = {uri: imageSourceMetadata.identiconURI};
      setImageSource(identiconSource);
      return;
    }
    if (!imageSourceMetadata.fullURI) {
      return;
    }
    const checkCacheAndSetSource = async () => {
      const cachePath = await FastImage.getCachePath({uri: imageSourceMetadata.fullURI!});
      const isFullCached = !!cachePath;

      if (isFullCached) {
        const fullSource = {uri: imageSourceMetadata.fullURI!};
        setImageSource(fullSource);
      } else {
        const fallbackUri = appConfig.skipThumbnails ? imageSourceMetadata.fullURI : imageSourceMetadata.thumbURI;
        if (!fallbackUri) {
          return;
        }
        const fallbackSource = {uri: fallbackUri};
        setImageSource(fallbackSource);
      }
    };
    checkCacheAndSetSource();
  }, [
    mode,
    staticSize,
    appConfig.skipThumbnails,
    imageSourceMetadata.fullURI,
    imageSourceMetadata.thumbURI,
    imageSourceMetadata.identiconURI,
  ]);

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

  if (!imageSource) {
    return (
      <Card.Content style={styles.loadingCard}>
        <ActivityIndicator />
      </Card.Content>
    );
  }

  const isThumbnail = imageSource.uri === imageSourceMetadata.thumbURI;

  return (
    <View>
      <AppImageViewer viewerImages={viewerImages} isVisible={isViewerVisible} setIsVisible={setIsViewerVisible} />
      <TouchableOpacity disabled={disableTouch} activeOpacity={1} onPress={onPress || onPressDefault}>
        <View style={styles.imageContainer}>
          {mode === 'cardcover' && (
            <FastImage
              resizeMode={'cover'}
              style={[styles.cardCover, style as FastImageStyle]}
              source={imageSource}
              onLoad={onLoad}
              onError={onError}
              onProgress={onProgress}
            />
          )}
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
          {mode === 'avatar' && (
            <FastImage
              resizeMode={'cover'}
              style={[styles.avatar, style as FastImageStyle]}
              source={imageSource}
              onLoad={onLoad}
              onError={onError}
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
          {appConfig.enableDeveloperOptions && mode !== 'avatar' && (
            <View style={styles.imageDebugIcon}>
              <AppIcon
                icon={isThumbnail ? AppIcons.thumbnail : staticSize === 'identicon' ? AppIcons.user : AppIcons.full}
                small={true}
                color={theme.colors.constantWhite}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
