import {useState} from 'react';

export interface UseSecretTriggerProps {
  /** Called every `triggerCount`th press (the 5th, 10th, 15th, ... by default). */
  onTrigger: () => void;
  /** How many presses between triggers. Defaults to 5, matching SecretHeaderTitle's prior default. */
  triggerCount?: number;
}

export interface UseSecretTriggerReturn {
  /** Wire this up to whatever Pressable/TouchableOpacity should carry the secret. */
  onPress: () => void;
}

/**
 * Hook for "tap N times to reveal a secret" UI, e.g. a hidden developer/debug action hung
 * off an otherwise-ordinary piece of text. Fires `onTrigger` every `triggerCount`th press
 * (not just once at that count), so the gesture can be repeated.
 *
 * Extracted from SecretHeaderTitle so the same pattern can be reused on non-header
 * Pressables (e.g. OobeWelcomeScreen's version/build text).
 *
 * @example
 * ```ts
 * const {onPress} = useSecretTrigger({onTrigger: revealDevMenu});
 * <Pressable onPress={onPress}><Text>Version 1.0</Text></Pressable>
 * ```
 */
export const useSecretTrigger = ({onTrigger, triggerCount = 5}: UseSecretTriggerProps): UseSecretTriggerReturn => {
  const [pressCount, setPressCount] = useState(0);

  const onPress = () => {
    // Needs to be a separate var because the state hasn't updated in time.
    const newPressCount = pressCount + 1;
    setPressCount(newPressCount);
    if (newPressCount % triggerCount === 0) {
      onTrigger();
    }
  };

  return {onPress};
};
