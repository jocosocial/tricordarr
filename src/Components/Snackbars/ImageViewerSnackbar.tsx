import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {SnackBarBase, SnackBarBaseProps} from '#src/Components/Snackbars/SnackBarBase';

interface ImageViewerSnackbarProps extends SnackBarBaseProps {
  bottomOffset?: number;
}

/**
 * Snackbar owned by the Lightbox overlay. Paper pins its wrapper to the bottom
 * of the parent; `bottomOffset` is the measured Footer height so the toast
 * sits above the filename / metadata panel instead of under it.
 */
export const ImageViewerSnackbar = ({
  setMessage,
  message,
  duration = 4000,
  messagePrefix = '✅ ',
  bottomOffset = 0,
}: ImageViewerSnackbarProps) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          bottom: bottomOffset,
          paddingBottom: 0,
          zIndex: 1,
        },
      }),
    [bottomOffset],
  );

  return (
    <SnackBarBase
      wrapperStyle={styles.wrapper}
      message={message}
      setMessage={setMessage}
      messagePrefix={messagePrefix}
      duration={duration}
      elevation={0}
    />
  );
};
