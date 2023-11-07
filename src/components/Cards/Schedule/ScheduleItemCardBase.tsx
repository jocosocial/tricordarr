import React from 'react';
import {Badge, Card, Text} from 'react-native-paper';
import {Linking, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {useAppTheme} from '../../../styles/Theme';
import {ListSection} from '../../Lists/ListSection';

interface ScheduleItemCardBaseProps {
  badgeValue?: string;
  showBadge?: boolean;
  title: string;
  duration?: string;
  author?: string;
  authorID?: string;
  participation?: string;
  location?: string;
  onPress?: () => void;
  cardStyle?: StyleProp<ViewStyle>;
  expandedView?: boolean;
}

const SimpleBody = ({
  title,
  duration,
  author,
  badgeValue,
  participation,
  location,
  showBadge = false,
}: ScheduleItemCardBaseProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    contentView: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
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
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
    },
  });
  return (
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
        {location && (
          <Text style={styles.bodyText} variant={'bodyMedium'}>
            {location}
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
  );
};

const ExpandedBody = ({
  title,
  duration,
  author,
  authorID,
  badgeValue,
  participation,
  location,
  showBadge = false,
}: ScheduleItemCardBaseProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    titleStyle: {
      ...commonStyles.onTwitarrButton,
    },
    descriptionStyle: {
      ...commonStyles.onTwitarrButton,
    },
    itemStyle: {
      ...commonStyles.paddingVerticalZero,
    },
  });
  return (
    <View>
      <ListSection>
        <DataFieldListItem
          title={'Title'}
          description={title}
          titleStyle={styles.titleStyle}
          descriptionStyle={styles.descriptionStyle}
          itemStyle={styles.itemStyle}
        />
        <DataFieldListItem
          title={'Time'}
          description={duration}
          titleStyle={styles.titleStyle}
          descriptionStyle={styles.descriptionStyle}
          itemStyle={styles.itemStyle}
        />
        <DataFieldListItem
          title={'Location'}
          description={location}
          titleStyle={styles.titleStyle}
          descriptionStyle={styles.descriptionStyle}
          itemStyle={styles.itemStyle}
        />
        <DataFieldListItem
          title={'Owner'}
          description={author}
          titleStyle={styles.titleStyle}
          descriptionStyle={styles.descriptionStyle}
          itemStyle={styles.itemStyle}
          onPress={authorID ? () => Linking.openURL(`tricordarr://user/${authorID}`) : undefined}
        />
      </ListSection>
    </View>
  );
};

export const ScheduleItemCardBase = ({
  title,
  duration,
  author,
  authorID,
  badgeValue,
  participation,
  cardStyle,
  location,
  onPress,
  showBadge = false,
  expandedView = false,
}: ScheduleItemCardBaseProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    cardContent: {
      ...commonStyles.paddingVerticalZero,
      ...commonStyles.paddingLeftZero,
      ...commonStyles.justifyCenter,
      ...commonStyles.paddingBottomZero,
    },
    cardTitle: {
      ...commonStyles.bold,
      ...commonStyles.onTwitarrButton,
    },
  });

  return (
    <Card mode={'contained'} style={cardStyle} onPress={onPress}>
      {expandedView && <Card.Title title={'Details'} titleStyle={styles.cardTitle} />}
      <Card.Content style={styles.cardContent}>
        {!expandedView && (
          <SimpleBody
            title={title}
            onPress={onPress}
            duration={duration}
            author={author}
            badgeValue={badgeValue}
            participation={participation}
            location={location}
            showBadge={showBadge}
          />
        )}
        {expandedView && (
          <ExpandedBody
            title={title}
            onPress={onPress}
            duration={duration}
            author={author}
            authorID={authorID}
            badgeValue={badgeValue}
            participation={participation}
            location={location}
            showBadge={showBadge}
          />
        )}
      </Card.Content>
    </Card>
  );
};
