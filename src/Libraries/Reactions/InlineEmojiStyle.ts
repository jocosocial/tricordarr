import {ImageStyle, Platform} from 'react-native';

/** An inline emoji's height in ems. Slightly taller than the letters, as chat apps draw them. */
const INLINE_EMOJI_EM = 1.25;
/** How far below the baseline an inline emoji hangs, in ems; about the depth of a descender. */
const INLINE_EMOJI_DROP_EM = 0.2;

/**
 * Sizes and places an emoji relative to the text around it, the way CSS does with
 * `height: 1.25em; vertical-align: -0.2em`. Both numbers follow the font size, so the emoji fits
 * its line and sits level with the letters whatever the text variant or accessibility text size.
 *
 * `textFontSize` is the size the text is drawn at, system font scaling included: inline views do
 * not scale with the text on their own.
 *
 * The drop is applied only on iOS, which stands an inline view on the baseline, where a view
 * taller than the letters pokes out of the top of its line. Android centres inline views itself.
 */
export const inlineEmojiStyle = (textFontSize: number, platform: string = Platform.OS): ImageStyle => {
  const size = Math.round(textFontSize * INLINE_EMOJI_EM);
  return {
    width: size,
    height: size,
    ...(platform === 'ios' ? {transform: [{translateY: textFontSize * INLINE_EMOJI_DROP_EM}]} : undefined),
  };
};
