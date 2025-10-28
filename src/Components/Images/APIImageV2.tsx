import FastImage, {ImageStyle as FastImageStyle} from '@d11/react-native-fast-image';
import React from 'react';
import {useCallback, useState} from 'react';
import {type ImageStyle as RNImageStyle, StyleProp, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Card} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppImageViewer} from '#src/Components/Images/AppImageViewer';
import {HelpModalView} from '#src/Components/Views/Modals/HelpModalView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {useModal} from '#src/Context/Contexts/ModalContext';
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

export const APIImageV2 = ({path, style, mode, disableTouch, initialSize}: APIImageV2Props) => {
  const [viewerImages, setViewerImages] = useState<APIImageV2Data[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const {commonStyles} = useStyles();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.images);
  const {setModalContent, setModalVisible} = useModal();
  const {appConfig} = useConfig();
  const [imageData, setImageData] = useState<APIImageV2Data>(APIImageV2Data.fromFileName(path, appConfig));

  const styles = StyleSheet.create({
    disabledCard: {
      ...commonStyles.marginVerticalSmall,
    },
    image: {
      ...commonStyles.headerImage,
      ...style,
    },
  });

  const onLoad = () => {
    setViewerImages([imageData]);
  };

  const onPress = useCallback(() => {
    setIsViewerVisible(true);
  }, [setIsViewerVisible]);

  /**
   * Function to show the disabled modal if we need to do that. See below.
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

  React.useEffect(() => {
    setImageData(APIImageV2Data.fromFileName(path, appConfig));
  }, [path, appConfig]);

  React.useEffect(() => {
    if (initialSize === 'thumb') {
      FastImage.preload([{uri: imageData.fullURI}]);
    }
  }, [initialSize, imageData.fullURI]);

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
            source={{uri: initialSize === 'full' ? imageData.fullURI : imageData.thumbURI}}
            onLoad={onLoad}
          />
        )}
        {/* {mode === 'scaledimage' && (
          <AppFastImage image={ImageQueryData.toImageURISource(imageQueryData)} style={style as FastImageStyle} />
        )} */}
      </TouchableOpacity>
    </View>
  );
};
