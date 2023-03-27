import React, {PropsWithChildren} from 'react';
import {Text} from 'react-native-paper';
import ReactTimeAgo from 'react-time-ago';
import {commonStyles} from '../../styles';

interface RelativeTimeTagProps {
  date?: Date;
  bold?: boolean;
}

// ReactTimeAgo doesn't support dynamic styling of the component, and it's own
// style parameter is not what you think it is.
const BoldText = ({children}: PropsWithChildren) => {
  return <Text style={{...commonStyles.bold}}>{children}</Text>;
};

/**
 * This follows the RelativeTimeTag from Swiftarr.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Site/Utilities/CustomLeafTags.swift.
 *
 * Relies on:
 * https://catamphetamine.gitlab.io/react-time-ago/
 * https://gitlab.com/catamphetamine/react-time-ago
 */
export const RelativeTimeTag = ({date, bold = false}: RelativeTimeTagProps) => {
  if (!date) {
    return <></>;
  }
  const component = bold ? BoldText : Text;
  // The Date.parse(date.toString()) is dumb.
  // https://github.com/catamphetamine/react-time-ago/issues/18
  return <ReactTimeAgo date={Date.parse(date.toString())} locale="en-US" component={component} />;
};
