import {TouchableOpacity, View, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {ForumData, PostData, UserHeader} from '#src/Structs/ControllerStructs';
import {ContentText} from '#src/Components/Text/ContentText';
import {ForumPostActionsMenu} from '#src/Components/Menus/Forum/ForumPostActionsMenu';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppIcons} from '#src/Enums/Icons';
import {useAppTheme} from '#src/Styles/Theme';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import Clipboard from '@react-native-clipboard/clipboard';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';

interface ForumPostMessageViewProps {
  postData: PostData;
  messageOnRight?: boolean;
  showAuthor?: boolean;
  enableShowInThread?: boolean;
  enablePinnedPosts?: boolean;
  forumData?: ForumData;
}

/**
 * This is a View container for a text message in the style of Android Messages or Signal.
 * It only contains the message itself.
 * Maybe dedupe with MessageView?
 */
export const ForumPostMessageView = ({
  postData,
  messageOnRight = false,
  showAuthor,
  enableShowInThread,
  enablePinnedPosts,
  forumData,
}: ForumPostMessageViewProps) => {
  const {commonStyles} = useStyles();
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const theme = useAppTheme();
  const commonNavigation = useCommonStack();
  const {data: favorites} = useUserFavoritesQuery();

  const styles = StyleSheet.create({
    messageView: {
      // commonStyles.paddingSmall,
      ...commonStyles.roundedBorderLarge,
      ...(messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer),
      ...(messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart),
      ...commonStyles.fullWidth,
    },
    messageText: {
      ...(messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer),
    },
    messageTextHeader: {
      ...(messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer),
      ...(showAuthor ? commonStyles.displayFlex : commonStyles.displayNone),
      ...commonStyles.bold,
      ...commonStyles.flexStart,
    },
    messageDateText: {},
    opacity: {
      ...commonStyles.paddingSmall,
      ...commonStyles.roundedBorderLarge,
    },
    authorContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
  });

  // Same as the button in the menu used in the menu
  const onPress = () => {
    commonNavigation.push(CommonStackComponents.forumThreadPostScreen, {
      postID: postData.postID.toString(),
    });
  };

  const hashtagOnPress = (tag: string) => {
    commonNavigation.push(CommonStackComponents.forumPostHashtagScreen, {
      hashtag: tag,
    });
  };

  const mentionOnPress = (username: string) => {
    const strippedName = username.replace('@', '');
    commonNavigation.push(CommonStackComponents.usernameProfileScreen, {
      username: strippedName,
    });
  };

  const onLongPress = () => Clipboard.setString(postData.text);

  return (
    <View style={styles.messageView}>
      <TouchableOpacity
        style={styles.opacity}
        onLongPress={enableShowInThread ? openMenu : onLongPress}
        activeOpacity={1}
        onPress={enableShowInThread ? onPress : openMenu}>
        <View style={styles.authorContainer}>
          {showAuthor && (
            <>
              <View>
                <UserBylineTag user={postData.author} style={styles.messageTextHeader} />
              </View>
              {UserHeader.contains(favorites, postData.author) && (
                <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />
              )}
            </>
          )}
        </View>
        <ForumPostActionsMenu
          visible={menuVisible}
          closeMenu={closeMenu}
          anchor={
            <ContentText
              textStyle={styles.messageText}
              text={postData.text}
              hashtagOnPress={hashtagOnPress}
              mentionOnPress={mentionOnPress}
            />
          }
          forumPost={postData}
          enableShowInThread={enableShowInThread}
          enablePinnedPosts={enablePinnedPosts}
          forumData={forumData}
        />
        <View style={[commonStyles.flexRow, commonStyles.justifySpaceBetween, commonStyles.alignItemsCenter]}>
          <View style={[commonStyles.flex0]}>
            {postData.createdAt && (
              <RelativeTimeTag
                date={new Date(postData.createdAt)}
                style={[styles.messageDateText, commonStyles.flexStart]}
                variant={'labelSmall'}
              />
            )}
          </View>
          <View style={[commonStyles.flex0, commonStyles.flexRow]}>
            {postData.isBookmarked && (
              <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} style={[commonStyles.flexEnd]} />
            )}
            {postData.isPinned && <AppIcon icon={AppIcons.pin} style={[commonStyles.flexEnd]} />}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
