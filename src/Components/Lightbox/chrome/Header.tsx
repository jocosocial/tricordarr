import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Item} from 'react-navigation-header-buttons';

import {HeaderBackButton} from '#src/Components/Buttons/HeaderButtons/HeaderBackButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PagerDots} from '#src/Components/Lightbox/chrome/PagerDots';
import {LightboxActionsMenu} from '#src/Components/Menus/Lightbox/LightboxActionsMenu';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';

interface HeaderProps {
  onRequestClose: () => void;
  onPressShare?: () => void;
  onPressSave?: () => void;
  onPressInfo?: () => void;
  imageCount: number;
  activeIndex: number;
}

/**
 * Lightbox header: the shared header back button (which closes the lightbox) and pager dots on
 * the left; an actions menu (download, settings, share) and, in developer mode only, an Info
 * button on the right. The back button matches the one in navigation
 * headers, so leaving the viewer looks like leaving any other screen.
 * Both use the shared header button components, so size, spacing and hit area match
 * navigation headers. `marginLeft: 'auto'` keeps them
 * right-justified even when pager dots are hidden for a single image.
 */
export const Header = ({
  onRequestClose,
  onPressShare,
  onPressSave,
  onPressInfo,
  imageCount,
  activeIndex,
}: HeaderProps) => {
  const insets = useSafeAreaInsets();
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          pointerEvents: 'box-none',
          paddingTop: insets.top,
        },
        actions: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifyContentEnd,
          marginLeft: 'auto',
          // Matches headerRightContainerStyle in navigation headers so the menu isn't flush to the edge.
          paddingRight: 16,
        },
      }),
    [commonStyles, insets.top],
  );

  return (
    <View style={styles.root}>
      <MaterialHeaderButtons left style={commonStyles.headerLeftWrapper}>
        <HeaderBackButton onPress={onRequestClose} color={theme.colors.onImageViewer} />
      </MaterialHeaderButtons>
      <PagerDots count={imageCount} activeIndex={activeIndex} />
      <View style={styles.actions}>
        <MaterialHeaderButtons>
          {appConfig.enableDeveloperOptions && onPressInfo && (
            <Item
              title={'Image info'}
              iconName={AppIcons.info}
              color={theme.colors.onImageViewer}
              onPress={onPressInfo}
            />
          )}
          <LightboxActionsMenu onPressSave={onPressSave} onPressShare={onPressShare} onRequestClose={onRequestClose} />
        </MaterialHeaderButtons>
      </View>
    </View>
  );
};
