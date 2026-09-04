import {SwiftarrClientApp, SwiftarrFeature} from '#src/Enums/AppFeatures';
import {SettingsAdminData, SettingsAppFeaturePair, SettingsUpdateData} from '#src/Structs/AdminControllerStructs';

/**
 * Stable identity for an app:feature pair used when computing enable/disable deltas.
 */
export const featurePairKey = (pair: SettingsAppFeaturePair): string => `${pair.app}:${pair.feature}`;

/**
 * Returns true when the given app:feature pair is present in the disabled list.
 */
export const isFeaturePairDisabled = (disabled: SettingsAppFeaturePair[], app: string, feature: string): boolean =>
  disabled.some(pair => pair.app === app && pair.feature === feature);

/**
 * Toggle a single app:feature pair in the disabled set. Does not mutate the input.
 */
export const toggleFeaturePair = (
  disabled: SettingsAppFeaturePair[],
  app: string,
  feature: string,
): SettingsAppFeaturePair[] => {
  if (isFeaturePairDisabled(disabled, app, feature)) {
    return disabled.filter(pair => !(pair.app === app && pair.feature === feature));
  }
  return [...disabled, {app, feature}];
};

/**
 * Compute the enable/disable deltas Swiftarr expects. Only pairs that changed are listed.
 * `enableFeatures` are pairs that were disabled and are now enabled.
 * `disableFeatures` are pairs that were enabled and are now disabled.
 */
export const computeFeatureDeltas = (
  original: SettingsAppFeaturePair[],
  current: SettingsAppFeaturePair[],
): {enableFeatures: SettingsAppFeaturePair[]; disableFeatures: SettingsAppFeaturePair[]} => {
  const originalKeys = new Set(original.map(featurePairKey));
  const currentKeys = new Set(current.map(featurePairKey));
  return {
    enableFeatures: original.filter(pair => !currentKeys.has(featurePairKey(pair))),
    disableFeatures: current.filter(pair => !originalKeys.has(featurePairKey(pair))),
  };
};

/**
 * Client apps that can appear in the feature-disable matrix. `unknown` is omitted because
 * it is a client-side fallback, not something the server stores.
 */
export const FEATURE_DISABLE_APPS: SwiftarrClientApp[] = [
  SwiftarrClientApp.all,
  SwiftarrClientApp.swiftarr,
  SwiftarrClientApp.tricordarr,
  SwiftarrClientApp.kraken,
  SwiftarrClientApp.cruisemonkey,
  SwiftarrClientApp.rainbowmonkey,
  SwiftarrClientApp.tacobarr,
];

/**
 * Features that can be enabled or disabled. `unknown` is omitted because it is a client-side fallback.
 */
export const FEATURE_DISABLE_FEATURES: SwiftarrFeature[] = [
  SwiftarrFeature.all,
  SwiftarrFeature.tweets,
  SwiftarrFeature.forums,
  SwiftarrFeature.seamail,
  SwiftarrFeature.schedule,
  SwiftarrFeature.friendlyfez,
  SwiftarrFeature.karaoke,
  SwiftarrFeature.microkaraoke,
  SwiftarrFeature.gameslist,
  SwiftarrFeature.images,
  SwiftarrFeature.users,
  SwiftarrFeature.phone,
  SwiftarrFeature.directphone,
  SwiftarrFeature.photostream,
  SwiftarrFeature.performers,
  SwiftarrFeature.personalevents,
  SwiftarrFeature.registration,
  SwiftarrFeature.hunts,
  SwiftarrFeature.eventFeedback,
  SwiftarrFeature.quartermaster,
];

/**
 * Build a settings POST body that only changes feature flags.
 * Swiftarr's settingsUpdateHandler treats a missing `minUserAccessLevel` as `.banned`,
 * so feature-only saves must still send the current access level.
 */
export const settingsUpdateFromFeatureDeltas = (
  data: SettingsAdminData,
  deltas: {enableFeatures: SettingsAppFeaturePair[]; disableFeatures: SettingsAppFeaturePair[]},
): SettingsUpdateData => ({
  minUserAccessLevel: data.minAccessUserLevel,
  enableFeatures: deltas.enableFeatures,
  disableFeatures: deltas.disableFeatures,
});
