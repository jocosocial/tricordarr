import React, {useCallback, useMemo, useState} from 'react';
import {LayoutChangeEvent, ScrollView, StyleSheet, View} from 'react-native';

import {ContentPostImageThumb} from '#src/Components/Images/ContentPostImageThumb';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {getImageCellSize, type ImageSize, POST_IMAGE_ASPECT_RATIO} from '#src/Libraries/ImageLayout';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ContentPostImageRowProps {
  /** Every image on the post. */
  images: AppImageMetaData[];
  /** Which of them are in this row. */
  indexes: number[];
  gap: number;
  alignEnd?: boolean;
  /** Fixed height. Otherwise the height follows the row's width. */
  height?: number;
}

// Sizes seen so far, by file name, so a recycled list cell lays out at its final widths right away
// rather than once its images have loaded again. File names are unique to their contents.
const knownImageSizes = new Map<string, ImageSize>();

/**
 * One row of a post's images, packed against one side, scrolling sideways if they do not fit. The
 * row's height never depends on its images, so their loading never moves anything outside the row.
 */
export const ContentPostImageRow = ({images, indexes, gap, alignEnd, height}: ContentPostImageRowProps) => {
  const {commonStyles} = useStyles();
  const [rowSize, setRowSize] = useState<ImageSize>();
  const [loadedSizes, setLoadedSizes] = useState<Record<string, ImageSize>>({});

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const {layout} = event.nativeEvent;
    setRowSize(previous =>
      previous && previous.width === layout.width && previous.height === layout.height
        ? previous
        : {width: layout.width, height: layout.height},
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
          ...(height === undefined ? {aspectRatio: POST_IMAGE_ASPECT_RATIO} : {height}),
        },
        content: {
          ...commonStyles.flexRow,
          ...(alignEnd ? commonStyles.justifyContentEnd : undefined),
          flexGrow: 1,
          gap,
        },
      }),
    [commonStyles, alignEnd, gap, height],
  );

  const cellSizes = useMemo(() => {
    if (!rowSize) {
      return undefined;
    }
    return indexes.map(index => {
      const {fileName} = images[index];
      return getImageCellSize(loadedSizes[fileName] ?? knownImageSizes.get(fileName), rowSize);
    });
  }, [rowSize, indexes, images, loadedSizes]);

  const cells = cellSizes?.map((cellSize, position) => (
    <ContentPostImageThumb
      key={images[indexes[position]].fileName}
      index={indexes[position]}
      images={images}
      style={cellSize}
      onImageSize={handleImageSize}
      showPosition={indexes.length > 1}
    />
  ));

  return (
    <View style={styles.row} onLayout={handleLayout}>
      {indexes.length > 1 ? (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
          {cells}
        </ScrollView>
      ) : (
        <View style={styles.content}>{cells}</View>
      )}
    </View>
  );
};
