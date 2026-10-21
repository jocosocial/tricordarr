import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppImage} from '#src/Components/Images/AppImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// Shrinks the cover image's height (the main driver of the card's vertical size) so the card
// is wider than it is tall. The card itself stays full width - only the cover gets shorter.
// The underlying Image defaults to resizeMode 'cover', so it crops to the new aspect ratio
// rather than stretching or squashing.
const COVER_SCALE = 0.8;
const DEFAULT_COVER_HEIGHT = 195;
const CARD_BORDER_WIDTH = 2;

interface OobeLocationCardProps {
  title: string;
  description: string;
  image: AppImageMetaData;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Selectable choice card used on OobeLocationScreen ("On Land" / "On Ship"). Tapping the
 * card only toggles its selected state - it does not navigate. OobeLocationScreen's Next
 * button carries out the navigation (and server URL pre-population) for whichever card is
 * selected. Selection is shown via a highlighted border plus a checkbox icon in the top
 * right corner of the card, mirroring the Card.Title `right` slot.
 */
export const OobeLocationCard = ({
  title,
  description,
  image,
  selected,
  onPress,
  disabled,
  testID,
}: OobeLocationCardProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {theme} = useAppTheme();

  // Paper's own v3 Card corner-radius formula.
  //
  // A real `borderWidth` on the card insets its content (image included) by that width,
  // so getting the image's own corner to visually nest inside the border meant giving it a
  // smaller, compensated radius (cardRadius - borderWidth). Measured on-device (zoomed
  // screenshot + pixel sampling), that compensated math left a few-px sliver of the card's
  // own background still showing in the corner - Android's rounded-corner rendering doesn't
  // honor the subtraction precisely at these sizes. Sidestepping it entirely: the border is
  // now a `position: absolute` decorative overlay instead of a real (layout-affecting)
  // border, so nothing is inset and the image can share the exact same cardRadius and the
  // exact same box as the card's own clip - one number, one coordinate frame, no math to
  // get slightly wrong.
  const cardRadius = theme.roundness * 3;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          // One elevation tint up from the screen behind it, so the card reads as distinct.
          backgroundColor: theme.colors.elevation.level1,
          borderRadius: cardRadius,
          overflow: 'hidden',
        },
        borderOverlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderWidth: CARD_BORDER_WIDTH,
          borderColor: selected ? theme.colors.twitarrPositiveButton : theme.colors.outline,
          borderRadius: cardRadius,
        },
        // A plain View with overflow hidden clips the image to the card's bottom corners
        // directly, instead of depending on Card.Cover's own (unreliable, on Android, for
        // an Image child) corner rounding to happen to match the card's.
        imageClip: {
          borderBottomLeftRadius: cardRadius,
          borderBottomRightRadius: cardRadius,
          overflow: 'hidden',
        },
        image: {
          height: DEFAULT_COVER_HEIGHT * COVER_SCALE,
        },
        // Paper's Card.Title bumps its minHeight to 72 whenever a `right` element is present,
        // which reads as oversized vertical padding around a single-line title. Shrink it back
        // down to match a title-only card; the title stays vertically centered in that row, and
        // the selection icon is pulled to the top of it (below) with a matching right inset.
        titleContainer: {
          minHeight: 50,
        },
        rightIcon: {
          alignSelf: 'flex-start',
          paddingTop: styleDefaults.marginSize / 2,
          paddingRight: styleDefaults.marginSize / 2,
        },
      }),
    [
      selected,
      theme.colors.twitarrPositiveButton,
      theme.colors.outline,
      theme.colors.elevation.level1,
      cardRadius,
      styleDefaults.marginSize,
    ],
  );

  const getRight = useCallback(
    () => (
      <AppIcon
        icon={selected ? AppIcons.cardSelected : AppIcons.cardUnselected}
        color={selected ? theme.colors.twitarrPositiveButton : theme.colors.outline}
      />
    ),
    [selected, theme.colors.twitarrPositiveButton, theme.colors.outline],
  );

  return (
    <Card elevation={0} style={styles.card} onPress={onPress} disabled={disabled} testID={testID}>
      <Card.Title
        title={title}
        titleVariant={'bodyLarge'}
        titleStyle={commonStyles.bold}
        style={styles.titleContainer}
        right={getRight}
        rightStyle={styles.rightIcon}
      />
      <Card.Content style={commonStyles.marginBottom}>
        <Text>{description}</Text>
      </Card.Content>
      <View style={styles.imageClip}>
        <AppImage image={image} mode={'cardcover'} style={styles.image} disableTouch={true} />
      </View>
      <View style={styles.borderOverlay} pointerEvents={'none'} />
    </Card>
  );
};
