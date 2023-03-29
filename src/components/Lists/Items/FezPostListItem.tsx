import React from 'react';
import {Text} from 'react-native-paper';
import {FezPostData} from '../../../libraries/Structs/ControllerStructs';
import {View, ViewStyle, TextStyle} from 'react-native';
import {FezAvatarImage} from '../../Images/FezAvatarImage';
import {useAppTheme} from '../../../styles/Theme';
import {commonStyles, styleDefaults} from '../../../styles';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {UserAvatarImage} from '../../Images/UserAvatarImage';

// https://github.com/akveo/react-native-ui-kitten/issues/1167
interface FezPostListItemProps {
  item: FezPostData;
  index: number;
  separators: {
    highlight: () => void;
    unhighlight: () => void;
    updateProps: (select: 'leading' | 'trailing', newProps: any) => void;
  };
  showAuthor: boolean;
}

export const FezPostListItem = ({item, index, separators, showAuthor = true}: FezPostListItemProps) => {
  const theme = useAppTheme();
  const {profilePublicData} = useUserData();
  const postBySelf = profilePublicData.header.userID === item.author.userID;
  const spacerMargin = postBySelf ? commonStyles.marginRightSmall : commonStyles.marginLeftSmall;

  type Styles = {
    messageView: ViewStyle;
    listItemContentView: ViewStyle;
    messageText: TextStyle;
    messageTextHeader: TextStyle;
    avatarContainerView: ViewStyle;
    listItemContainerView: ViewStyle;
    messageViewContainer: ViewStyle;
    spacerView: ViewStyle;
  };

  const styles: Styles = {
    listItemContainerView: {
      ...commonStyles.flex,
      ...commonStyles.marginHorizontal,
    },
    messageView: {
      backgroundColor: postBySelf ? theme.colors.primaryContainer : theme.colors.secondaryContainer,
      borderRadius: theme.roundness * 4,
      alignSelf: postBySelf ? 'flex-end' : 'flex-start',
      padding: styleDefaults.marginSize / 2,
    },
    listItemContentView: {
      ...commonStyles.flex,
      ...commonStyles.flexRow,
      alignSelf: postBySelf ? 'flex-end' : 'flex-start',
    },
    messageText: {
      color: postBySelf ? theme.colors.onPrimaryContainer : theme.colors.onSecondaryContainer,
    },
    messageTextHeader: {
      display: postBySelf ? 'none' : 'flex',
      fontWeight: 'bold',
    },
    avatarContainerView: {
      ...commonStyles.marginRightSmall,
      ...commonStyles.flexColumn,
      alignSelf: 'flex-end',
      // Don't do Display here because it'll trigger an unncessary avatar load.
    },
    messageViewContainer: {
      flex: 1,
    },
    spacerView: {
      ...spacerMargin,
      width: styleDefaults.avatarSizeSmall * 2,
    },
  };

  return (
    <View style={styles.listItemContainerView}>
      <View style={styles.listItemContentView}>
        {!postBySelf && (
          <View style={styles.avatarContainerView}>
            <UserAvatarImage userID={item.author.userID} small={true} />
          </View>
        )}
        {postBySelf && <View style={styles.spacerView} />}
        <View style={styles.messageViewContainer}>
          <View style={styles.messageView}>
            {showAuthor && (
              <Text style={{...styles.messageText, ...styles.messageTextHeader}}>{item.author.username}</Text>
            )}
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        </View>
        {!postBySelf && <View style={styles.spacerView} />}
      </View>
    </View>
  );
};
