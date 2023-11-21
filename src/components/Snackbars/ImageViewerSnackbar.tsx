import React from 'react';
import {SnackBarBase, SnackBarBaseProps} from './SnackBarBase';

export const ImageViewerSnackbar = ({
  setMessage,
  message,
  duration = 4000,
  messagePrefix = '✅ ',
}: SnackBarBaseProps) => {
  return <SnackBarBase message={message} setMessage={setMessage} messagePrefix={messagePrefix} duration={duration} />;
};
