import React, {ReactNode, useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {ContentText} from '#src/Components/Text/ContentText';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface MessageViewActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
}

interface MessageViewProps {
  author: UserHeader;
  text: string;
  timestamp: Date;
  messageOnRight?: boolean;
  showAuthor?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  hashtagOnPress?: (tag: string) => void;
  mentionOnPress?: (username: string) => void;
  showByline?: boolean;
  showFavoriteAuthor?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
  renderActionsMenu: (props: MessageViewActionsMenuProps) => ReactNode;
}

/**
 * View container for a text message in the style of Android Messages or Signal.
 * It only contains the message itself. Callers supply the long-press actions menu
 * and any forum-specific chrome via props.
 */
export const MessageView = ({
  author,
  text,
  timestamp,
  messageOnRight = false,
  showAuthor,
  fullWidth,
  onPress,
  hashtagOnPress,
  mentionOnPress,
  showByline,
  showFavoriteAuthor,
  isBookmarked,
  isPinned,
  renderActionsMenu,
}: MessageViewProps) => {
  const {commonStyles} = useStyles();
  const {visible: menuVisible, openMenu, closeMenu} = useMenu();
  const {theme} = useAppTheme();
  const {data: favorites} = useUserFavoritesQuery({enabled: !!showFavoriteAuthor});

  const styles = useMemo(
    () =>
      StyleSheet.create({
        messageView: {
          ...commonStyles.roundedBorderLarge,
          ...(messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer),
          ...(messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart),
          ...(fullWidth ? commonStyles.fullWidth : undefined),
        },
        messageText: {
          ...(messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer),
        },
        messageTextHeader: {
          ...(messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer),
          ...(showAuthor ? commonStyles.displayFlex : commonStyles.displayNone),
          ...commonStyles.bold,
          ...(showByline ? commonStyles.flexStart : undefined),
        },
        opacity: {
          ...commonStyles.paddingSmall,
          ...commonStyles.roundedBorderLarge,
        },
        authorContainer: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.flex,
        },
        authorNameContainer: {
          flexShrink: 1,
        },
        favoriteUserIconContainer: {
          ...commonStyles.flex0,
          ...commonStyles.flexStart,
        },
        postIconsContainer: {
          ...commonStyles.flex0,
          ...commonStyles.flexRow,
        },
        postFooterContainer: {
          ...commonStyles.flexRow,
          ...commonStyles.justifySpaceBetween,
          ...commonStyles.alignItemsCenter,
        },
      }),
    [commonStyles, fullWidth, messageOnRight, showAuthor, showByline],
  );

  return (
    <View style={styles.messageView}>
      <TouchableOpacity
        style={styles.opacity}
        activeOpacity={1}
        /**
         * The onLongPress used to be a onPress, and onLongPress would copy to clipboard.
         * Touching items was too sensitive and lead to unexpected menu opens. So I am
         * electing to make openMenu a long press instead since copy is an option in the menu.
         *
         * If onPress is provided (aka we're in a PostList-style view) then
         * keep the regular onPress action.
         */
        onPress={onPress}
        onLongPress={openMenu}>
        {showAuthor && showByline && (
          <View style={styles.authorContainer}>
            <View style={styles.authorNameContainer}>
              <UserBylineTag user={author} style={styles.messageTextHeader} selectable={false} />
            </View>
            {showFavoriteAuthor && UserHeader.contains(favorites, author) && (
              <View style={styles.favoriteUserIconContainer}>
                <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />
              </View>
            )}
          </View>
        )}
        {showAuthor && !showByline && <Text style={styles.messageTextHeader}>{author.username}</Text>}
        {renderActionsMenu({
          visible: menuVisible,
          closeMenu,
          anchor: (
            <ContentText
              textStyle={styles.messageText}
              text={text}
              hashtagOnPress={hashtagOnPress}
              mentionOnPress={mentionOnPress}
              selectable={false}
            />
          ),
        })}
        <View style={styles.postFooterContainer}>
          <View style={commonStyles.flex0}>
            <RelativeTimeTag date={timestamp} variant={'labelSmall'} />
          </View>
          <View style={styles.postIconsContainer}>
            {isBookmarked && (
              <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} style={commonStyles.flexEnd} />
            )}
            {isPinned && <AppIcon icon={AppIcons.pin} style={commonStyles.flexEnd} />}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
