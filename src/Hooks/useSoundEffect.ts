import {useCallback, useEffect, useRef} from 'react';
import Sound from 'react-native-sound';

interface UseSoundEffectResult {
  playSound: () => void;
}

/**
 * Hook for playing sound effects using react-native-sound.
 */
export const useSoundEffect = (soundName: string): UseSoundEffectResult => {
  const soundRef = useRef<Sound | null>(null);

  useEffect(() => {
    // Enable playback in silence mode (iOS)
    Sound.setCategory('Playback');

    const sound = new Sound(soundName, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('failed to load sound', error);
      }
    });

    sound.setVolume(1);

    soundRef.current = sound;

    return () => {
      sound?.release();
    };
  }, [soundName]);

  const playSound = useCallback(() => {
    const sound = soundRef.current;
    if (sound && sound.isLoaded()) {
      sound.stop(() => {
        sound.play();
      });
    }
  }, []);

  return {
    playSound,
  };
};
