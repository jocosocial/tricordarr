import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';

import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ModeratorActionType} from '#src/Enums/ModeratorActionType';
import {ReportType} from '#src/Enums/ReportType';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ModeratorActionLogData} from '#src/Structs/ControllerStructs';

interface ModerationLogListItemProps {
  action: ModeratorActionLogData;
  onPress: () => void;
}

/**
 * One logged moderator action: who acted, what they did, and who it targeted.
 */
export const ModerationLogListItem = ({action, onPress}: ModerationLogListItemProps) => {
  const navigation = useCommonStack();
  const {commonStyles} = useStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalSmall,
          ...commonStyles.flexColumn,
        },
        headerRow: {
          ...commonStyles.flexRow,
          alignItems: 'flex-start',
        },
        bylineContainer: {
          ...commonStyles.flex,
        },
        label: {
          ...commonStyles.fontSizeLabel,
          ...commonStyles.onBackground,
        },
        sectionLabel: {
          ...commonStyles.fontSizeLabel,
          ...commonStyles.onBackground,
          ...commonStyles.marginTopSmall,
        },
        byline: {
          ...commonStyles.fontSizeDefault,
        },
        time: {
          ...commonStyles.marginLeftSmall,
        },
        action: {
          ...commonStyles.fontSizeDefault,
          ...commonStyles.onBackground,
        },
      }),
    [commonStyles],
  );

  const onPressModerator = useCallback(() => {
    navigation.push(CommonStackComponents.userProfileScreen, {userID: action.moderator.userID});
  }, [action.moderator.userID, navigation]);

  const onPressTarget = useCallback(() => {
    navigation.push(CommonStackComponents.userProfileScreen, {userID: action.targetUser.userID});
  }, [action.targetUser.userID, navigation]);

  return (
    <TouchableRipple onPress={onPress}>
      <View style={styles.container}>
        <Text style={styles.label} selectable={false}>
          Moderator:
        </Text>
        <View style={styles.headerRow}>
          <View style={styles.bylineContainer}>
            <UserBylineTag user={action.moderator} onPress={onPressModerator} style={styles.byline} />
          </View>
          <RelativeTimeTag date={new Date(action.timestamp)} style={styles.time} />
        </View>
        <Text style={styles.sectionLabel} selectable={false}>
          Action:
        </Text>
        <Text style={styles.action} selectable={false}>
          {`${ModeratorActionType.getLabel(action.actionType)} ${ReportType.getLabel(action.contentType)}`}
        </Text>
        <Text style={styles.sectionLabel} selectable={false}>
          Target:
        </Text>
        <UserBylineTag user={action.targetUser} onPress={onPressTarget} style={styles.byline} />
      </View>
    </TouchableRipple>
  );
};
