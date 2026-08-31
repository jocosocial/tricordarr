import React, {useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {ContentPostImages} from '#src/Components/Images/ContentPostImages';
import {ContentText} from '#src/Components/Text/ContentText';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface ModerationContentPreviewProps {
  author: UserHeader;
  timestamp?: string;
  text?: string;
  images?: string[];
  bylinePrefix?: string;
}

/**
 * Compact preview of reported content: avatar, byline, relative time, text, and images.
 */
export const ModerationContentPreview = ({
  author,
  timestamp,
  text,
  images,
  bylinePrefix,
}: ModerationContentPreviewProps) => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.flexRow,
        },
        body: {
          ...commonStyles.flex,
          ...commonStyles.paddingLeftSmall,
        },
        header: {
          ...commonStyles.flexRow,
          ...commonStyles.justifySpaceBetween,
          ...commonStyles.alignItemsCenter,
        },
        text: {
          ...commonStyles.marginTopSmall,
        },
        images: {
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: author.userID})}>
        <AvatarImage userHeader={author} small={true} />
      </TouchableOpacity>
      <View style={styles.body}>
        <View style={styles.header}>
          <UserBylineTag
            user={author}
            prefix={bylinePrefix}
            onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: author.userID})}
          />
          {!!timestamp && <RelativeTimeTag date={new Date(timestamp)} />}
        </View>
        {!!text && (
          <View style={styles.text}>
            <ContentText text={text} />
          </View>
        )}
        {!!images && images.length > 0 && (
          <View style={styles.images}>
            <ContentPostImages images={images} />
          </View>
        )}
        {!text && (!images || images.length === 0) && <Text variant={'bodySmall'}>No text or images.</Text>}
      </View>
    </View>
  );
};
