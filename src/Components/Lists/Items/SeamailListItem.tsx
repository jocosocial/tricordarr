import React, {Dispatch, memo, SetStateAction} from 'react';
import {StyleSheet, View} from 'react-native';
import {Checkbox} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {FezAvatarImage} from '#src/Components/Images/FezAvatarImage';
import {ListItem} from '#src/Components/Lists/ListItem';
import {SeamailListItemSwipeable} from '#src/Components/Swipeables/SeamailListItemSwipeable';
import {SeamailMessageCountIndicator} from '#src/Components/Text/SeamailMessageCountIndicator';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SelectionActions} from '#src/Context/Reducers/SelectionReducer';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useChatStack} from '#src/Navigation/Stacks/ChatStackNavigator';
import {FezData} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

interface SeamailListItemProps {
  fez: FezData;
  enableSelection: boolean;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
  selected: boolean;
}

const SeamailListItemInternal = ({fez, enableSelection, setEnableSelection, selected}: SeamailListItemProps) => {
  const {currentUserID} = useSession();
  const navigation = useChatStack();
  const {commonStyles} = useStyles();
  const {dispatchSelectedItems} = useSelection();
  let badgeCount = 0;
  if (fez.members) {
    badgeCount = fez.members.postCount - fez.members.readCount;
  }

  const styles = StyleSheet.create({
    title: {
      ...(badgeCount && !fez.members?.isMuted ? commonStyles.bold : undefined),
    },
    description: {
      ...(badgeCount && !fez.members?.isMuted ? commonStyles.bold : undefined),
    },
    leftContainer: {
      ...commonStyles.paddingLeftSmall,
      justifyContent: 'center',
    },
    postCountColor: {
      color: '#cfcfcf',
    },
    timeStyleActive: {
      ...commonStyles.bold,
    },
    rightContainer: {
      ...commonStyles.verticalContainer,
      ...commonStyles.alignItemsEnd,
      ...commonStyles.paddingLeftSmall,
    },
    avatar: {
      ...commonStyles.paddingLeftSmall,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
    },
    item: {
      ...commonStyles.background,
      ...commonStyles.paddingRightSmall,
    },
    checkboxContainer: {
      ...commonStyles.flexColumn,
      ...commonStyles.justifyCenter,
      ...commonStyles.paddingLeftSmall,
    },
  });

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== currentUserID) || [];
  const description = otherParticipants.map(p => p.username).join(', ');

  const handleSelection = () => {
    dispatchSelectedItems({
      type: SelectionActions.select,
      item: Selectable.fromFezData(fez),
    });
  };

  const onLongPress = () => {
    setEnableSelection(true);
    handleSelection();
  };

  const getAvatar = () => (
    <View style={styles.avatar}>
      <FezAvatarImage fez={fez} />
    </View>
  );

  const getLeft = () => {
    return (
      <View style={styles.checkboxContainer}>
        <Checkbox status={selected ? 'checked' : 'unchecked'} onPress={handleSelection} />
      </View>
    );
  };

  const onPress = () =>
    navigation.push(CommonStackComponents.seamailChatScreen, {
      fezID: fez.fezID,
    });

  const getRight = () => {
    const totalPostCount = fez.members?.postCount || 0;

    if (fez.members?.isMuted) {
      return (
        <View style={styles.leftContainer}>
          <AppIcon icon={AppIcons.mute} />
        </View>
      );
    }

    return (
      <View style={styles.rightContainer}>
        <SeamailMessageCountIndicator badgeCount={badgeCount} totalPostCount={totalPostCount} />
        <View>
          <RelativeTimeTag
            date={new Date(fez.lastModificationTime)}
            variant={'bodyMedium'}
            style={badgeCount ? styles.timeStyleActive : undefined}
          />
        </View>
      </View>
    );
  };

  /**
   * descriptionNumberOfLines={1} is needed to prevent the description from wrapping
   * multiple lines. The default seems to have been 2. The right length of participants
   * would cause it to render an excess newline with no content on it. So I'm clipping
   * the description to one line.
   */
  return (
    <SeamailListItemSwipeable fez={fez} enabled={!enableSelection}>
      <ListItem
        style={styles.item}
        title={fez.title}
        titleStyle={styles.title}
        titleNumberOfLines={0}
        description={description}
        descriptionStyle={styles.description}
        descriptionNumberOfLines={1}
        onPress={enableSelection ? handleSelection : onPress}
        onLongPress={onLongPress}
        left={enableSelection ? getLeft : getAvatar}
        right={getRight}
      />
    </SeamailListItemSwipeable>
  );
};

export const SeamailListItem = memo(SeamailListItemInternal);
