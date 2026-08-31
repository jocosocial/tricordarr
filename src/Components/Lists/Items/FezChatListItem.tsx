import React, {Dispatch, memo, SetStateAction, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Checkbox, Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {FezAvatarImage} from '#src/Components/Images/FezAvatarImage';
import {ListItem} from '#src/Components/Lists/ListItem';
import {FezChatListItemSwipeable} from '#src/Components/Swipeables/FezChatListItemSwipeable';
import {SeamailMessageCountIndicator} from '#src/Components/Text/SeamailMessageCountIndicator';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SelectionActions} from '#src/Context/Reducers/SelectionReducer';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {getParticipantLabel} from '#src/Hooks/useFezData';
import {unreadCount as unreadPostCount} from '#src/Libraries/UnreadCounts';
import {useChatStack} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {FezData} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

interface FezChatListItemProps {
  fez: FezData;
  enableSelection: boolean;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
  selected: boolean;
}

const FezChatListItemInternal = ({fez, enableSelection, setEnableSelection, selected}: FezChatListItemProps) => {
  const {currentUserID} = useSession();
  const navigation = useChatStack();
  const {commonStyles} = useStyles();
  const {dispatchSelectedItems} = useSelection();
  const {asPrivilegedUser} = useElevation();
  const {theme} = useAppTheme();

  let badgeCount = 0;
  if (fez.members) {
    badgeCount = unreadPostCount(fez.members.postCount, fez.members.readCount);
  }

  const showParticipation = FezType.isLFGType(fez.fezType) || fez.fezType === FezType.privateEvent;
  const isUnread = !!badgeCount && !fez.members?.isMuted;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...(isUnread ? commonStyles.bold : undefined),
        },
        description: {
          ...(isUnread ? commonStyles.bold : undefined),
        },
        leftContainer: {
          ...commonStyles.paddingLeftSmall,
          justifyContent: 'center',
        },
        timeStyle: {
          ...(badgeCount ? commonStyles.bold : undefined),
          ...commonStyles.textAlignRight,
        },
        participantStyle: {
          ...commonStyles.textAlignRight,
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
      }),
    [badgeCount, commonStyles, isUnread],
  );

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== currentUserID) || [];
  const participantNames = otherParticipants.map(p => p.username).join(', ');

  const getParticipationDescription = () => (
    <View>
      <UserBylineTag
        user={fez.owner}
        includePronoun={false}
        variant={'bodyMedium'}
        prefix={'by'}
        style={styles.description}
        selectable={false}
        numberOfLines={1}
      />
      <Text variant={'bodyMedium'} style={styles.description}>
        {FezType.getChatTypeString(fez.fezType)}
      </Text>
    </View>
  );

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

  const onPress = () => {
    const chatParams = {
      fezID: fez.fezID,
      initialReadCount: fez.members?.readCount,
    };
    const screen = FezType.getChatScreen(fez.fezType);
    if (screen === CommonStackComponents.lfgChatScreen) {
      navigation.push(screen, chatParams);
    } else if (screen === CommonStackComponents.privateEventChatScreen) {
      navigation.push(screen, chatParams);
    } else {
      navigation.push(screen, {
        ...chatParams,
        asPrivilegedUser,
      });
    }
  };

  const getRight = () => {
    const totalPostCount = fez.members?.postCount || 0;

    if (fez.members?.isMuted) {
      return (
        <View style={styles.leftContainer}>
          <AppIcon icon={AppIcons.mute} color={theme.colors.twitarrNegativeButton} />
        </View>
      );
    }

    return (
      <View style={styles.rightContainer}>
        <SeamailMessageCountIndicator badgeCount={badgeCount} totalPostCount={totalPostCount} />
        {showParticipation && (
          <Text variant={'bodyMedium'} style={styles.participantStyle}>
            {getParticipantLabel(fez)}
          </Text>
        )}
        <View>
          <RelativeTimeTag date={new Date(fez.lastModificationTime)} variant={'bodyMedium'} style={styles.timeStyle} />
        </View>
      </View>
    );
  };

  /**
   * descriptionNumberOfLines={1} is needed for Seamail rows to prevent the participant list
   * from wrapping. LFG and private event rows use two lines (owner byline + type label).
   */
  return (
    <FezChatListItemSwipeable fez={fez} enabled={!enableSelection}>
      <ListItem
        style={styles.item}
        title={fez.title}
        titleStyle={styles.title}
        titleNumberOfLines={0}
        description={showParticipation ? getParticipationDescription : participantNames}
        descriptionStyle={styles.description}
        descriptionNumberOfLines={showParticipation ? 2 : 1}
        onPress={enableSelection ? handleSelection : onPress}
        onLongPress={onLongPress}
        left={enableSelection ? getLeft : getAvatar}
        right={getRight}
      />
    </FezChatListItemSwipeable>
  );
};

export const FezChatListItem = memo(FezChatListItemInternal);
