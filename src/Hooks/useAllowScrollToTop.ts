import {isIOS} from '#src/Libraries/Platform/Detection';

/**
 * We only want to use this context value on iOS because the `scrollsToTop` prop is iOS-only
 * removing it saves us a re-render on Android.
 *
 * This came from Bluesky.
 *
 * Lightbox is their image viewing component. I don't think I care about that yet.
 * The performance benefit exists. Certainly a micro-optimization.
 */
const useAllowScrollToTopIOS = () => {
  //   const {activeLightbox} = useLightbox();
  //   return !activeLightbox;
  return true;
};
export const useAllowScrollToTop = isIOS ? useAllowScrollToTopIOS : () => undefined;
