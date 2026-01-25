import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {IconButton} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {PhotostreamImageActionsMenu} from '#src/Components/Menus/Photostream/PhotostreamImageActionsMenu';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';

interface PhotostreamAuthorViewProps {
  image: PhotostreamImageData;
}

export const PhotostreamImageHeaderView = (props: PhotostreamAuthorViewProps) => {
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
      userID: props.image.author.userID,
    });

  return (
    <View style={styles.viewContainer}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onHeaderPress}>
        <AvatarImage userHeader={props.image.author} />
      </TouchableOpacity>
      <View style={styles.rowContainer}>
        <TouchableOpacity onPress={onHeaderPress}>
          <UserBylineTag user={props.image.author} style={commonStyles.bold} />
        </TouchableOpacity>
        <RelativeTimeTag date={new Date(props.image.createdAt)} variant={'labelMedium'} />
      </View>
      <View>
        <PhotostreamImageActionsMenu
          anchor={<IconButton icon={AppIcons.menu} style={styles.menuIconButton} onPress={openMenu} />}
          image={props.image}
          closeMenu={closeMenu}
          visible={menuVisible}
        />
      </View>
    </View>
  );
};
