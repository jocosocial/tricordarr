import React, {createContext, useContext, useMemo, useState} from 'react';
import {measure, type MeasuredDimensions} from 'react-native-reanimated';
import {scheduleOnRN, scheduleOnUI} from 'react-native-worklets';
import {v4 as uuidv4} from 'uuid';

import {type LightboxImage} from '#src/Components/Lightbox/types';
import {useNonReactiveCallback} from '#src/Hooks/useNonReactiveCallback';

export type Lightbox = {
  id: string;
  images: LightboxImage[];
  index: number;
  allowSave?: boolean;
  allowShare?: boolean;
};

const LightboxContext = createContext<{
  activeLightbox: Lightbox | null;
}>({
  activeLightbox: null,
});
LightboxContext.displayName = 'LightboxContext';

const LightboxControlContext = createContext<{
  openLightbox: (lightbox: Omit<Lightbox, 'id'>) => void;
  closeLightbox: () => boolean;
}>({
  openLightbox: () => {},
  closeLightbox: () => false,
});
LightboxControlContext.displayName = 'LightboxControlContext';

/**
 * Holds the active lightbox session. Open requests while one is already
 * showing are ignored so the user has to dismiss the current one first.
 */
export const LightboxProvider = ({children}: React.PropsWithChildren) => {
  const [activeLightbox, setActiveLightbox] = useState<Lightbox | null>(null);

  const doOpen = useNonReactiveCallback((lightbox: Omit<Lightbox, 'id'>) => {
    setActiveLightbox(prevLightbox => {
      if (prevLightbox) {
        return prevLightbox;
      }
      return {...lightbox, id: uuidv4()};
    });
  });

  const openLightbox = useNonReactiveCallback((lightbox: Omit<Lightbox, 'id'>) => {
    const thumbRef = lightbox.images[lightbox.index]?.thumbRef;
    if (thumbRef) {
      // Measure the tapped image on the UI thread, then open with the rect
      // baked in so it's available from the first render. Only the rect
      // (plain data) goes through scheduleOnRN — AnimatedRef objects can't
      // survive serialization across threads.
      const openWithRect = (rect: MeasuredDimensions | null) => {
        doOpen({
          ...lightbox,
          images: lightbox.images.map((img, i) => (i === lightbox.index ? {...img, thumbRect: rect} : img)),
        });
      };
      scheduleOnUI(() => {
        'worklet';
        const rect = measure(thumbRef);
        scheduleOnRN(openWithRect, rect);
      });
    } else {
      doOpen(lightbox);
    }
  });

  const closeLightbox = useNonReactiveCallback(() => {
    const wasActive = !!activeLightbox;
    setActiveLightbox(null);
    return wasActive;
  });

  const state = useMemo(
    () => ({
      activeLightbox,
    }),
    [activeLightbox],
  );

  const methods = useMemo(
    () => ({
      openLightbox,
      closeLightbox,
    }),
    [openLightbox, closeLightbox],
  );

  return (
    <LightboxContext.Provider value={state}>
      <LightboxControlContext.Provider value={methods}>{children}</LightboxControlContext.Provider>
    </LightboxContext.Provider>
  );
};

export function useLightbox() {
  return useContext(LightboxContext);
}

export function useLightboxControls() {
  return useContext(LightboxControlContext);
}
