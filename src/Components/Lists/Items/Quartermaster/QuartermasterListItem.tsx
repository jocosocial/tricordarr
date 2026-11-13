import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Chip} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {APIImage} from '#src/Components/Images/APIImage';
import {ListItem} from '#src/Components/Lists/ListItem';
import {QuartermasterListItemSwipeable} from '#src/Components/Swipeables/QuartermasterListItemSwipeable';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {AppIcons} from '#src/Enums/Icons';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {useQuartermasterViewer} from '#src/Hooks/Quartermaster/useQuartermasterViewer';
import {
  canInteractWithQuartermasterItem,
  isQuarantinedQuartermasterItem,
  isRestrictedQuartermasterItem,
} from '#src/Libraries/Quartermaster/QuartermasterAccess';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {QuartermasterData} from '#src/Structs/ControllerStructs';

interface QuartermasterListItemProps {
  item: QuartermasterData;
}

const THUMBNAIL_SIZE = 56;

/**
 * Compact row for a Quartermastarr item: photo (or a category icon), name, and
 * "location · owner" (or "Anonymous" when the owner's name is hidden). Tapping opens the item,
 * except for quarantined and auto-quarantined items, which the viewer is not
 * allowed to open, which render the server's masked text inert.
 */
const QuartermasterListItemInternal = ({item}: QuartermasterListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const navigation = useCommonStack();
  const viewer = useQuartermasterViewer();
  const canOpen = canInteractWithQuartermasterItem(item, viewer);
  const restricted = isRestrictedQuartermasterItem(item);
  const quarantined = isQuarantinedQuartermasterItem(item);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          backgroundColor: theme.colors.background,
          ...commonStyles.paddingHorizontalSmall,
        },
        thumbnail: {
          width: THUMBNAIL_SIZE,
          height: THUMBNAIL_SIZE,
          ...commonStyles.roundedBorder,
          overflow: 'hidden',
          ...commonStyles.justifyCenter,
          ...commonStyles.alignItemsCenter,
          backgroundColor: theme.colors.surfaceVariant,
        },
        title: {
          ...commonStyles.bold,
          ...commonStyles.onBackground,
        },
        right: {
          ...commonStyles.justifyCenter,
        },
      }),
    [commonStyles, theme.colors.background, theme.colors.surfaceVariant],
  );

  // A quarantined item's text is masked by the server. Show one plain notice in place of the
  // masked name, and leave out the masked location, which would only repeat it.
  const title = quarantined ? 'Item is under moderator review' : item.itemName;
  const description = [
    quarantined ? undefined : item.location,
    item.owner ? getUserBylineString(item.owner, false, true) : 'Anonymous',
  ]
    .filter(Boolean)
    .join(' · ');

  const onPress = useCallback(
    () => navigation.push(CommonStackComponents.quartermasterItemScreen, {itemID: item.itemID}),
    [navigation, item.itemID],
  );

  const getLeft = useCallback(
    () => (
      <View style={styles.thumbnail}>
        {item.image ? (
          <APIImage
            path={item.image}
            mode={'cardcover'}
            staticSize={'thumb'}
            disableTouch={true}
            style={{height: THUMBNAIL_SIZE, width: THUMBNAIL_SIZE}}
          />
        ) : (
          <AppIcon
            icon={
              item.category === QuartermasterCategory.have ? AppIcons.quartermasterHave : AppIcons.quartermasterNeed
            }
          />
        )}
      </View>
    ),
    [item.image, item.category, styles.thumbnail],
  );

  const getRight = useCallback(
    () =>
      // Quarantined rows say so in their title; only the other restricted state (locked) needs a chip.
      restricted && !quarantined ? (
        <View style={styles.right}>
          <Chip compact={true}>{ContentModerationStatus.getLabel(item.moderationStatus)}</Chip>
        </View>
      ) : null,
    [restricted, quarantined, item.moderationStatus, styles.right],
  );

  return (
    <QuartermasterListItemSwipeable item={item} enabled={canOpen}>
      <ListItem
        testID={`quartermasterItem-${item.itemID}`}
        style={styles.item}
        title={title}
        titleStyle={styles.title}
        titleNumberOfLines={2}
        description={description}
        descriptionNumberOfLines={2}
        left={getLeft}
        right={getRight}
        onPress={canOpen ? onPress : undefined}
      />
    </QuartermasterListItemSwipeable>
  );
};

/**
 * Memoized row for a Quartermastarr item, so list re-renders only touch rows that changed.
 */
export const QuartermasterListItem = memo(QuartermasterListItemInternal);
