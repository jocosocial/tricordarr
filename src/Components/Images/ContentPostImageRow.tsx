import React, {useCallback, useMemo, useState} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';

import {ContentPostImageThumb} from '#src/Components/Images/ContentPostImageThumb';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {getRowImageSizes, type ImageSize} from '#src/Libraries/ImageLayout';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ContentPostImageRowProps {
  /** Every image on the post. */
  images: AppImageMetaData[];
  /** Which of them are in this row. */
  indexes: number[];
  aspectRatio: number;
  gap: number;
  alignEnd?: boolean;
}

// Sizes seen so far, by file name, so a recycled list cell lays out at its final widths right away
// rather than once its images have loaded again. File names are unique to their contents.
const knownImageSizes = new Map<string, ImageSize>();

/**
 * One row of a post's images, packed against one side. Each image is as wide as its shape needs. The
 * row's height comes only from its width, so images loading never move anything outside the row.
 */
export const ContentPostImageRow = ({images, indexes, aspectRatio, gap, alignEnd}: ContentPostImageRowProps) => {
  const {commonStyles} = useStyles();
  const [rowSize, setRowSize] = useState<ImageSize>();
  const [loadedSizes, setLoadedSizes] = useState<Record<string, ImageSize>>({});

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setRowSize(previous =>
      previous && previous.width === width && previous.height === height ? previous : {width, height},
    );
  }, []);

  const handleImageSize = useCallback((fileName: string, size: ImageSize) => {
    knownImageSizes.set(fileName, size);
    setLoadedSizes(previous => ({...previous, [fileName]: size}));
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.fullWidth,
          ...commonStyles.flexRow,
          ...(alignEnd ? commonStyles.justifyContentEnd : undefined),
          aspectRatio,
          gap,
        },
        unmeasuredTile: {
          ...commonStyles.flex,
        },
      }),
    [commonStyles, alignEnd, aspectRatio, gap],
  );

  const tileSizes = useMemo(() => {
    if (!rowSize) {
      return undefined;
    }
    const imageSizes = indexes.map(index => {
      const {fileName} = images[index];
      return loadedSizes[fileName] ?? knownImageSizes.get(fileName);
    });
    return getRowImageSizes(imageSizes, rowSize, gap);
  }, [rowSize, indexes, images, loadedSizes, gap]);

  return (
    <View style={styles.row} onLayout={handleLayout}>
      {indexes.map((index, position) => (
        <ContentPostImageThumb
          key={images[index].fileName}
          index={index}
          images={images}
          style={tileSizes?.[position] ?? styles.unmeasuredTile}
          onImageSize={handleImageSize}
        />
      ))}
    </View>
  );
};
