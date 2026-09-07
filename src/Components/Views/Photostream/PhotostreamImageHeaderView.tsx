import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {IconButton} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {PhotostreamImageActionsMenu} from '#src/Components/Menus/Photostream/PhotostreamImageActionsMenu';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';

interface PhotostreamAuthorViewProps {
  image: PhotostreamImageData;
  hideMenuButton?: boolean;
}

export const PhotostreamImageHeaderView = ({image, hideMenuButton}: PhotostreamAuthorViewProps) => {
  const {commonStyles} = useStyles();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const commonNavigation = useCommonStack();

  const styles = StyleSheet.create({
    viewContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.paddingVerticalSmall,
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.alignItemsCenter,
    },
    avatarContainer: {
      ...commonStyles.marginRightSmall,
    },
    rowContainer: {
      ...commonStyles.flex,
    },
    menuIconButton: {
      ...commonStyles.marginZero,
    },
  });

  const onHeaderPress = () =>
    commonNavigation.push(CommonStackComponents.userProfileScreen, {
      userID: image.author.userID,
    });

  return (
    <View style={styles.viewContainer}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onHeaderPress}>
        <AvatarImage userHeader={image.author} />
      </TouchableOpacity>
      <View style={styles.rowContainer}>
        <TouchableOpacity onPress={onHeaderPress}>
          <UserBylineTag user={image.author} style={commonStyles.bold} />
        </TouchableOpacity>
        <RelativeTimeTag date={new Date(image.createdAt)} variant={'labelMedium'} />
      </View>
      {!hideMenuButton && (
        <View>
          <PhotostreamImageActionsMenu
            anchor={<IconButton icon={AppIcons.menu} style={styles.menuIconButton} onPress={openMenu} />}
            image={image}
            closeMenu={closeMenu}
            visible={menuVisible}
          />
        </View>
      )}
    </View>
  );
};
