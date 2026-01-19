import FastImage from '@d11/react-native-fast-image';
import React, {useEffect, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppImageMetaData, AppImageMode} from '#src/Types/AppImageMetaData';

interface ImageMetadataViewProps {
  image: AppImageMetaData;
}

export const ImageMetadataView = ({image}: ImageMetadataViewProps) => {
  const {commonStyles} = useStyles();
  const [cachePath, setCachePath] = React.useState<string | null>(null);

  const styles = StyleSheet.create({
    textContainer: {
      ...commonStyles.imageViewerBackgroundAlpha,
    },
    infoText: {
      ...commonStyles.marginBottomSmall,
      ...commonStyles.onImageViewer,
    },
  });

  // Compute display URI synchronously when image changes
  const displayURI = useMemo(() => {
    if (!image) return '';
    const imageURI = AppImageMetaData.getSourceURI(image);
    const displayLength = 200;
    if (imageURI.length > displayLength) {
      return `${imageURI.substring(0, displayLength)}...`;
    }
    return imageURI;
  }, [image]);

  // Fetch cache path asynchronously when image changes
  useEffect(() => {
    if (!image) {
      setCachePath(null);
      return;
    }

    const fetchCachePath = async () => {
      if (image.mode === AppImageMode.api || image.mode === AppImageMode.identicon) {
        try {
          const sourceURI = AppImageMetaData.getSourceURI(image);
          const path = await FastImage.getCachePath({uri: sourceURI});
          setCachePath(path);
        } catch (error) {
          console.error('Error fetching cache path:', error);
          setCachePath(null);
        }
      } else {
        setCachePath(null);
      }
    };

    fetchCachePath();
  }, [image]);

  return (
    <PaddedContentView padTop={true} style={styles.textContainer}>
      <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
        mimeType: {image.mimeType}
      </Text>
      <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
        mode: {image.mode}
      </Text>
      <HyperlinkText disableLinkInterpolation={true}>
        <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
          URI: {displayURI}
        </Text>
      </HyperlinkText>
      <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
        Cache Path: {cachePath ?? 'N/A'}
      </Text>
    </PaddedContentView>
  );
};
