import ImageView from 'react-native-image-viewing';
import React, {Dispatch, SetStateAction, useCallback, useState} from 'react';
import {View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {ImageViewerSnackbar} from '../Snackbars/ImageViewerSnackbar';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ImageQueryData} from '../../libraries/Types';
import {saveImageToLocal} from '../../libraries/Storage/ImageStorage';

interface AppImageViewerProps {
  initialIndex?: number;
  viewerImages?: ImageQueryData[];
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

interface ImageViewerComponentProps {
  imageIndex: number;
}

export const AppImageViewer = ({isVisible, setIsVisible, viewerImages = [], initialIndex = 0}: AppImageViewerProps) => {
  const [viewerMessage, setViewerMessage] = useState<string>();
  const {commonStyles} = useStyles();

  const saveImage = useCallback(
    async (index: number) => {
      try {
        const image = viewerImages[index];
        await saveImageToLocal(image);
        setViewerMessage('Saved to camera roll.');
      } catch (error: any) {
        setViewerMessage(error);
      }
    },
    [viewerImages],
  );

  const viewerHeader = useCallback(
    ({imageIndex}: ImageViewerComponentProps) => {
      return (
        <View style={[commonStyles.flexRow, commonStyles.justifyContentEnd]}>
          <IconButton icon={AppIcons.download} onPress={() => saveImage(imageIndex)} />
          <IconButton icon={AppIcons.close} onPress={() => setIsVisible(false)} />
        </View>
      );
    },
    [commonStyles.flexRow, commonStyles.justifyContentEnd, saveImage, setIsVisible],
  );

  const viewerFooter = useCallback(
    ({imageIndex}: ImageViewerComponentProps) => {
      return <ImageViewerSnackbar message={viewerMessage} setMessage={setViewerMessage} />;
    },
    [viewerMessage],
  );

  const onRequestClose = () => setIsVisible(false);

  if (!viewerImages) {
    return <></>;
  }

  viewerImages.map(image => {
    console.log('Looking at image', image.fileName);
  });

  return (
    <ImageView
      images={viewerImages.map(image => {
        return {uri: image.dataURI};
      })}
      imageIndex={initialIndex}
      visible={isVisible}
      onRequestClose={onRequestClose}
      HeaderComponent={viewerHeader}
      animationType={'none'}
      FooterComponent={viewerFooter}
    />
  );
};
