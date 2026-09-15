import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PagerDots} from '#src/Components/Lightbox/chrome/PagerDots';
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
 * Lightbox header: pager dots on the left, Info / Save / Share / Close on the right.
 * Action icons use Paper IconButton at the same size and shape as navigation headers
 * (and the previous ImageViewerHeaderView). Paper's default 6px margin is stripped
 * so the cluster matches header density. `marginLeft: 'auto'` keeps them
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
          paddingLeft: 16,
        },
        actions: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifyContentEnd,
          marginLeft: 'auto',
        },
        iconButton: {
          ...commonStyles.marginZero,
        },
      }),
    [commonStyles, insets.top],
  );

  return (
    <View style={styles.root}>
      <PagerDots count={imageCount} activeIndex={activeIndex} />
      <View style={styles.actions}>
        {onPressInfo && (
          <IconButton
            icon={AppIcons.info}
            onPress={onPressInfo}
            iconColor={theme.colors.onImageViewer}
            accessibilityLabel={'Image info'}
            style={styles.iconButton}
          />
        )}
        {onPressSave && (
          <IconButton
            icon={AppIcons.download}
            onPress={onPressSave}
            iconColor={theme.colors.onImageViewer}
            accessibilityLabel={'Save image'}
            style={styles.iconButton}
          />
        )}
        {onPressShare && (
          <IconButton
            icon={AppIcons.share}
            onPress={onPressShare}
            iconColor={theme.colors.onImageViewer}
            accessibilityLabel={'Share image'}
            style={styles.iconButton}
          />
        )}
        <IconButton
          icon={AppIcons.close}
          onPress={onRequestClose}
          iconColor={theme.colors.onImageViewer}
          accessibilityLabel={'Close image'}
          style={styles.iconButton}
        />
      </View>
    </View>
  );
};
