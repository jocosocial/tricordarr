import React from 'react';
import {Text} from 'react-native-paper';
import ReactTimeAgo from 'react-time-ago';

interface RelativeTimeTagProps {
  date?: Date;
}

/**
 * This follows the RelativeTimeTag from Swiftarr.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Site/Utilities/CustomLeafTags.swift.
 *
 * Relies on:
 * https://catamphetamine.gitlab.io/react-time-ago/
 * https://gitlab.com/catamphetamine/react-time-ago
 */
export const RelativeTimeTag = ({date}: RelativeTimeTagProps) => {
  if (!date) {
    return <></>;
  }
  return <ReactTimeAgo date={date} locale="en-US" component={Text} />;
};
