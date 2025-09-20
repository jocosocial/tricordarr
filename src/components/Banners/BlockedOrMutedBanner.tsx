import React from 'react';
import {Banner, Text} from 'react-native-paper';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface Props {
  blocked?: boolean;
  muted?: boolean;
}

export const BlockedOrMutedBanner = ({blocked, muted}: Props) => {
  const {commonStyles} = useStyles();

  let statusText = 'This user is ';
  if (blocked && muted) {
    statusText += 'blocked and muted. You will not see content from them, and they will not see content from you.';
  } else if (blocked) {
    statusText += 'blocked. You will not see content from them, and they will not see content from you.';
  } else if (muted) {
    statusText += 'muted. You will not see content from them, but they will continue to see content from you.';
  } else {
    statusText += 'UNKNOWN?!';
  }

  if (!blocked && !muted) {
    return <></>;
  }

  return (
    <Banner style={[commonStyles.errorContainer]} visible={true}>
      <Text style={[commonStyles.errorContainer]}>{statusText}</Text>
    </Banner>
  );
};
