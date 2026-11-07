import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {List} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

interface EventLinkedPerformerListItemProps {
  performer: PerformerHeaderData;
}

/**
 * Row for a performer linked to an event: photo avatar, name, and official/shadow type. Laid
 * out like UserListItem. Tapping opens the performer. Stays swipe-free; wrap it in
 * EventPerformerListItemSwipeable for unlink.
 */
const EventLinkedPerformerListItemInternal = ({performer}: EventLinkedPerformerListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const navigation = useCommonStack();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          ...commonStyles.paddingHorizontalSmall,
          paddingVertical: 2,
          backgroundColor: theme.colors.background,
        },
        avatar: {
          ...commonStyles.justifyCenter,
        },
        officialIcon: {
          ...commonStyles.flexColumn,
          ...commonStyles.justifyCenter,
        },
      }),
    [commonStyles, theme],
  );

  const getAvatar = useCallback(
    () => (
      <View style={styles.avatar}>
        <AvatarImage imageName={performer.photo} icon={AppIcons.performer} />
      </View>
    ),
    [performer.photo, styles.avatar],
  );

  const getOfficialIcon = useCallback(
    () => (
      <View style={styles.officialIcon}>
        <AppIcon icon={AppIcons.official} />
      </View>
    ),
    [styles.officialIcon],
  );

  const onPress = useCallback(() => {
    if (performer.id) {
      navigation.push(CommonStackComponents.performerScreen, {id: performer.id});
    }
  }, [navigation, performer.id]);

  return (
    <List.Item
      style={styles.item}
      title={performer.name}
      description={performer.isOfficialPerformer ? 'Official Performer' : 'Shadow Performer'}
      onPress={onPress}
      left={getAvatar}
      right={performer.isOfficialPerformer ? getOfficialIcon : undefined}
    />
  );
};

export const EventLinkedPerformerListItem = memo(EventLinkedPerformerListItemInternal);
