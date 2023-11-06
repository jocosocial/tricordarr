import React from 'react';
import {Badge, Card, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {getDurationString} from '../../../libraries/DateTime';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';

interface LfgCardProps {
  lfg: FezData;
  showAuthor?: boolean;
}

export const LfgCard = ({lfg, showAuthor = true}: LfgCardProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    cardTitle: {
      ...commonStyles.paddingLeftZero,
    },
    contentView: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    cardContent: {
      ...commonStyles.paddingVerticalZero,
      ...commonStyles.paddingLeftZero,
      ...commonStyles.justifyCenter,
    },
    officialCard: {
      backgroundColor: theme.colors.twitarrNeutralButton,
    },
    shadowCard: {
      backgroundColor: theme.colors.jocoPurple,
    },
    lfgCard: {
      backgroundColor: theme.colors.outline,
    },
    contentBody: {
      ...commonStyles.flex,
      ...commonStyles.marginLeft,
      ...commonStyles.paddingVertical,
    },
    bodyText: {
      ...commonStyles.onTwitarrButton,
    },
    badgeContainer: {
      ...commonStyles.flexEnd,
    },
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
    },
    titleTextContainer: {
      ...commonStyles.flexStart,
    },
    titleText: {
      ...commonStyles.bold,
    },
    titleContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
      ...commonStyles.alignItemsCenter,
    },
  });

  const unreadCount = lfg.members ? lfg.members.postCount - lfg.members.readCount : 0;

  return (
    <Card mode={'contained'}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.contentView}>
          <View style={styles.contentBody}>
            <View style={styles.titleContainer}>
              <View style={styles.titleTextContainer}>
                <Text style={styles.titleText} variant={'titleMedium'}>
                  {lfg.title}
                </Text>
              </View>
              <View style={commonStyles.badgeContainer}>
                {!!unreadCount && <Badge style={styles.badge}>{`${unreadCount} new posts`}</Badge>}
              </View>
            </View>
            <Text style={styles.bodyText} variant={'bodyMedium'}>
              {getDurationString(lfg.startTime, lfg.endTime, lfg.timeZone, true)}
            </Text>
            {showAuthor && (
              <Text style={styles.bodyText} variant={'bodyMedium'}>
                Hosted by: {UserHeader.getByline(lfg.owner)}
              </Text>
            )}
            <Text style={styles.bodyText} variant={'bodyMedium'}>
              {lfg.members?.participants.length}/{lfg.maxParticipants} attendees
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
