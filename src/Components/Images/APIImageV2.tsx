import FastImage, {ImageStyle as FastImageStyle} from '@d11/react-native-fast-image';
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
import {ImageQueryData} from '#src/Types';

const APIImageSizePaths = {
  thumb: 'thumb',
  full: 'full',
} as const;

interface APIImageV2Props {
  path: string;
  style?: StyleProp<FastImageStyle | RNImageStyle>;
  mode?: 'cardcover' | 'image' | 'avatar' | 'scaledimage';
  disableTouch?: boolean;
  initialSize?: keyof typeof APIImageSizePaths;
}

export const APIImageV2 = ({path, style, mode, disableTouch, initialSize}: APIImageV2Props) => {
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const {commonStyles} = useStyles();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.images);
  const {setModalContent, setModalVisible} = useModal();
  const {appConfig} = useConfig();

  const appConfigInitialSize = !initialSize && appConfig.skipThumbnails ? 'full' : initialSize;
  const imageURI = `${appConfig.serverUrl}${appConfig.urlPrefix}/image/${appConfigInitialSize}/${path}`;

  const styles = StyleSheet.create({
    image: {
      ...commonStyles.headerImage,
      ...style,
    },
  });

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

  /**
   * If the Images feature of Swiftarr is disabled, then show a generic disabled icon.
   */
  if (isDisabled) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <AppIcon icon={AppIcons.imageDisabled} onPress={handleDisableModal} />
      </Card.Content>
    );
  }

  return (
    <View>
      <AppImageViewer viewerImages={viewerImages} isVisible={isViewerVisible} setIsVisible={setIsViewerVisible} />
      <TouchableOpacity disabled={disableTouch} activeOpacity={1}>
        {/* {mode === 'cardcover' && (
          <Card.Cover style={style as RNImageStyle} source={ImageQueryData.toImageSource(imageQueryData)} />
        )} */}
        {mode === 'image' && <FastImage resizeMode={'cover'} style={styles.image} source={{uri: imageURI}} />}
        {/* {mode === 'scaledimage' && (
          <AppFastImage image={ImageQueryData.toImageURISource(imageQueryData)} style={style as FastImageStyle} />
        )} */}
      </TouchableOpacity>
    </View>
  );
};
