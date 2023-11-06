import React from 'react';
import {Badge, Card, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {getDurationString} from '../../../libraries/DateTime';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {commonStyles} from '../../../styles';

interface LfgCardProps {
  fez: FezData;
  showAuthor?: boolean;
}

export const LfgCard = ({fez, showAuthor = true}: LfgCardProps) => {
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
    badge: {
      // ...commonStyles.marginLeftSmall,
      // ...commonStyles.fontSizeDefault,
      ...commonStyles.bold,
      // fontSize: 14,
      ...commonStyles.paddingHorizontalSmall,
    },
    titleText: {
      ...commonStyles.bold,
    },
  });

  const unreadCount = fez.members ? fez.members.postCount - fez.members.readCount : 0;

  return (
    <Card mode={'contained'}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.contentView}>
          <View style={styles.contentBody}>
            <View style={{
              ...commonStyles.flexRow,
              ...commonStyles.justifySpaceBetween,
              ...commonStyles.alignItemsCenter,
            }}>
              <View style={{alignSelf: 'flex-start'}}>
                <Text style={styles.titleText} variant={'titleMedium'}>
                  {fez.title}
                </Text>
              </View>
              <View style={{alignSelf: 'flex-end'}}>
                {!!unreadCount && <Badge style={styles.badge}>{`${unreadCount} new posts`}</Badge>}
              </View>
            </View>
            <Text style={styles.bodyText} variant={'bodyMedium'}>
              {getDurationString(fez.startTime, fez.endTime, fez.timeZone, true)}
            </Text>
            {showAuthor && (
              <Text style={styles.bodyText} variant={'bodyMedium'}>
                Hosted by: {UserHeader.getByline(fez.owner)}
              </Text>
            )}
            <Text style={styles.bodyText} variant={'bodyMedium'}>
              {fez.members?.participants.length}/{fez.maxParticipants} attendees
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
