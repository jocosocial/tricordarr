import React from 'react';
import {Badge, Card, Text} from 'react-native-paper';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface ScheduleItemCardBaseProps {
  badgeValue?: string;
  showBadge: boolean;
  title: string;
  duration?: string;
  author?: string;
  participation?: string;
  cardStyle?: StyleProp<ViewStyle>;
}

export const ScheduleItemCardBase = ({
  title,
  duration,
  author,
  badgeValue,
  participation,
  cardStyle,
  showBadge = false,
}: ScheduleItemCardBaseProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    contentView: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    cardContent: {
      ...commonStyles.paddingVerticalZero,
      ...commonStyles.paddingLeftZero,
      ...commonStyles.justifyCenter,
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
      ...commonStyles.onTwitarrButton,
    },
    titleContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
      ...commonStyles.alignItemsCenter,
    },
  });

  return (
    <Card mode={'contained'} style={cardStyle}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.contentView}>
          <View style={styles.contentBody}>
            <View style={styles.titleContainer}>
              <View style={styles.titleTextContainer}>
                <Text style={styles.titleText} variant={'titleMedium'}>
                  {title}
                </Text>
              </View>
              <View style={commonStyles.badgeContainer}>
                {showBadge && <Badge style={styles.badge}>{badgeValue}</Badge>}
              </View>
            </View>
            {duration && (
              <Text style={styles.bodyText} variant={'bodyMedium'}>
                {duration}
              </Text>
            )}
            {author && (
              <Text style={styles.bodyText} variant={'bodyMedium'}>
                {author}
              </Text>
            )}
            {participation && (
              <Text style={styles.bodyText} variant={'bodyMedium'}>
                {participation}
              </Text>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
