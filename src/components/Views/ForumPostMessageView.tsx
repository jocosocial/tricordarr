import {Text} from 'react-native-paper';
import {TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {RelativeTimeTag} from '../Text/RelativeTimeTag';
import {PostData, UserHeader} from '../../libraries/Structs/ControllerStructs';
import {ContentText} from '../Text/ContentText';
import {ForumPostActionsMenu} from '../Menus/Forum/ForumPostActionsMenu';
import {AppIcon} from '../Icons/AppIcon';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useAppTheme} from '../../styles/Theme';
import {useUserRelations} from '../Context/Contexts/UserRelationsContext';
import {
  BottomTabComponents,
  ForumStackComponents,
  MainStackComponents,
  RootStackComponents
} from '../../libraries/Enums/Navigation';
import {useRootStack} from '../Navigation/Stacks/RootStackNavigator';
import {useForumStackNavigation} from '../Navigation/Stacks/ForumStackNavigator';
import {useBottomTabNavigator} from '../Navigation/Tabs/BottomTabNavigator';

interface ForumPostMessageViewProps {
  postData: PostData;
  messageOnRight?: boolean;
  showAuthor?: boolean;
  enableShowInThread?: boolean;
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
}: ForumPostMessageViewProps) => {
  const {commonStyles} = useStyles();
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const theme = useAppTheme();
  const {favorites} = useUserRelations();
  const forumNavigation = useForumStackNavigation();
  const bottomNavigation = useBottomTabNavigator();

  const styles = {
    messageView: [
      // commonStyles.paddingSmall,
      commonStyles.roundedBorderLarge,
      messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart,
      commonStyles.fullWidth,
    ],
    messageText: [messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer],
    messageTextHeader: [
      messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      showAuthor ? commonStyles.displayFlex : commonStyles.displayNone,
      commonStyles.bold,
    ],
    messageDateText: [],
    opacity: [commonStyles.paddingSmall, commonStyles.roundedBorderLarge],
  };

  // Same as the button in the menu used in the menu
  const onPress = () => {
    forumNavigation.push(ForumStackComponents.forumThreadPostScreen, {
      postID: postData.postID.toString(),
    });
  };

  const hashtagOnPress = (tag) => {
    forumNavigation.push(ForumStackComponents.forumPostHashtagScreen, {
      hashtag: tag,
    });
  };

  const mentionOnPress = (username) => {
    bottomNavigation.navigate(BottomTabComponents.homeTab, {
      screen: MainStackComponents.userProfileScreen,
      params: {
        userID: username,
      },
    });
  };

  return (
    <View style={styles.messageView}>
      <TouchableOpacity
        style={styles.opacity}
        onLongPress={openMenu}
        onPress={enableShowInThread ? onPress : undefined}>
        <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter]}>
          {showAuthor && (
            <>
              <View>
                <Text style={[styles.messageTextHeader, commonStyles.flexStart]}>
                  {UserHeader.getByline(postData.author)}
                </Text>
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
          anchor={<ContentText textStyle={styles.messageText} text={postData.text} hashtagOnPress={hashtagOnPress} />}
          forumPost={postData}
          enableShowInThread={enableShowInThread}
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
          <View style={[commonStyles.flex0]}>
            {postData.isBookmarked && (
              <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} style={[commonStyles.flexEnd]} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
