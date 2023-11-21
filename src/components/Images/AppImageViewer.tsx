import ImageView from 'react-native-image-viewing';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {ImageViewerSnackbar} from '../Snackbars/ImageViewerSnackbar';
import {ImageSource} from 'react-native-vector-icons/Icon';
import {useStyles} from '../Context/Contexts/StyleContext';

interface AppImageViewerProps {
  initialIndex?: number;
  viewerImages?: ImageSource[];
}

interface ImageViewerComponentProps {
  imageIndex: number;
}

export const AppImageViewer = ({viewerImages = [], initialIndex = 0}: AppImageViewerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [viewerMessage, setViewerMessage] = useState<string>();
  const {commonStyles} = useStyles();

  const saveImage = (index: number) => console.log('foo', index);

  const viewerHeader = useCallback(
    ({imageIndex}: ImageViewerComponentProps) => {
      return (
        <View style={[commonStyles.flexRow, commonStyles.justifyContentEnd]}>
          <IconButton icon={AppIcons.download} onPress={() => saveImage(imageIndex)} />
          <IconButton icon={AppIcons.close} onPress={() => setIsVisible(false)} />
        </View>
      );
    },
    [commonStyles],
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

  return (
    <ImageView
      images={viewerImages}
      imageIndex={initialIndex}
      visible={isVisible}
      onRequestClose={onRequestClose}
      HeaderComponent={viewerHeader}
      animationType={'none'}
      FooterComponent={viewerFooter}
    />
  );
};
