import {
  computeFeatureDeltas,
  featurePairKey,
  isFeaturePairDisabled,
  settingsUpdateFromFeatureDeltas,
  toggleFeaturePair,
} from '#src/Libraries/Admin/FeatureDisable';
import {SettingsAdminData, SettingsAppFeaturePair} from '#src/Structs/AdminControllerStructs';

describe('settingsUpdateFromFeatureDeltas', () => {
  it('always includes the current minUserAccessLevel so Swiftarr does not reset it to banned', () => {
    const data = {
      minAccessUserLevel: 'moderator',
      disabledFeatures: [{app: 'all', feature: 'forums'}],
    } as SettingsAdminData;
    expect(settingsUpdateFromFeatureDeltas(data, {enableFeatures: [], disableFeatures: []})).toEqual({
      minUserAccessLevel: 'moderator',
      enableFeatures: [],
      disableFeatures: [],
    });
  });
});

describe('featurePairKey', () => {
  it('joins app and feature', () => {
    expect(featurePairKey({app: 'tricordarr', feature: 'forums'})).toBe('tricordarr:forums');
  });
});

describe('isFeaturePairDisabled', () => {
  const disabled: SettingsAppFeaturePair[] = [{app: 'all', feature: 'seamail'}];

  it('is true for a listed pair', () => {
    expect(isFeaturePairDisabled(disabled, 'all', 'seamail')).toBe(true);
  });

  it('is false for a pair that is not listed', () => {
    expect(isFeaturePairDisabled(disabled, 'tricordarr', 'seamail')).toBe(false);
  });
});

describe('toggleFeaturePair', () => {
  it('adds a pair that is not currently disabled', () => {
    expect(toggleFeaturePair([], 'tricordarr', 'forums')).toEqual([{app: 'tricordarr', feature: 'forums'}]);
  });

  it('removes a pair that is currently disabled', () => {
    expect(toggleFeaturePair([{app: 'kraken', feature: 'phone'}], 'kraken', 'phone')).toEqual([]);
  });
});

describe('computeFeatureDeltas', () => {
  it('lists newly enabled pairs', () => {
    const original: SettingsAppFeaturePair[] = [{app: 'all', feature: 'forums'}];
    expect(computeFeatureDeltas(original, [])).toEqual({
      enableFeatures: [{app: 'all', feature: 'forums'}],
      disableFeatures: [],
    });
  });

  it('lists newly disabled pairs', () => {
    const current: SettingsAppFeaturePair[] = [{app: 'swiftarr', feature: 'users'}];
    expect(computeFeatureDeltas([], current)).toEqual({
      enableFeatures: [],
      disableFeatures: [{app: 'swiftarr', feature: 'users'}],
    });
  });

  it('returns empty deltas when nothing changed', () => {
    const pairs: SettingsAppFeaturePair[] = [{app: 'all', feature: 'all'}];
    expect(computeFeatureDeltas(originalWith(pairs), pairs)).toEqual({
      enableFeatures: [],
      disableFeatures: [],
    });
  });
});

/**
 * Copy helper so the "unchanged" fixture is not the same array instance as `current`.
 */
function originalWith(pairs: SettingsAppFeaturePair[]): SettingsAppFeaturePair[] {
  return pairs.map(pair => ({...pair}));
}
