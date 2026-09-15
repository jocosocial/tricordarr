import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Chip, Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SwiftarrClientApp, SwiftarrFeature} from '#src/Enums/AppFeatures';
import {
  FEATURE_DISABLE_APPS,
  FEATURE_DISABLE_FEATURES,
  isFeaturePairDisabled,
} from '#src/Libraries/Admin/FeatureDisable';
import {SettingsAppFeaturePair} from '#src/Structs/AdminControllerStructs';

interface AdminFeatureMatrixProps {
  disabledFeatures: SettingsAppFeaturePair[];
  onToggle: (app: string, feature: string) => void;
  editable: boolean;
}

/**
 * Per-feature, per-client toggle grid for server feature flags.
 * A filled chip (twitarrNegativeButton) means that app:feature pair is currently disabled.
 * Disabling `all` for a feature turns the feature off at the API for every client.
 * When the matrix is not editable, chips stay visible but are dimmed and un-pressable.
 */
export const AdminFeatureMatrix = ({disabledFeatures, onToggle, editable}: AdminFeatureMatrixProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        featureBlock: {
          ...commonStyles.paddingBottomSmall,
        },
        featureTitle: {
          ...commonStyles.bold,
        },
        featureDescription: {
          ...commonStyles.marginBottomSmall,
        },
        chipRow: {
          ...commonStyles.flexRow,
          flexWrap: 'wrap',
          gap: 8,
        },
        chip: {
          marginBottom: 4,
        },
        chipOff: {
          marginBottom: 4,
          backgroundColor: theme.colors.twitarrNegativeButton,
        },
        chipOffText: {
          color: theme.colors.onTwitarrNegativeButton,
        },
        chipTextDim: {
          color: theme.colors.onSurfaceDisabled,
        },
        legend: {
          ...commonStyles.paddingBottomSmall,
        },
      }),
    [commonStyles, theme],
  );

  return (
    <View>
      <View style={styles.legend}>
        <Text>
          Filled chips are disabled. Outlined chips are enabled. Disabling a feature for All Clients turns it off at the
          API for every app. Tap Save Changes after making edits.
        </Text>
      </View>
      {FEATURE_DISABLE_FEATURES.map(feature => (
        <View key={feature} style={styles.featureBlock}>
          <Text style={styles.featureTitle}>{SwiftarrFeature.getLabel(feature)}</Text>
          <Text style={styles.featureDescription} variant={'bodySmall'}>
            {SwiftarrFeature.getDescription(feature)}
          </Text>
          <View style={styles.chipRow}>
            {FEATURE_DISABLE_APPS.map(app => {
              const isFeatureDisabled = isFeaturePairDisabled(disabledFeatures, app, feature);
              const chipTextStyle = !editable ? styles.chipTextDim : isFeatureDisabled ? styles.chipOffText : undefined;
              return (
                <Chip
                  key={`${app}:${feature}`}
                  style={isFeatureDisabled ? styles.chipOff : styles.chip}
                  textStyle={chipTextStyle}
                  mode={isFeatureDisabled ? 'flat' : 'outlined'}
                  compact={true}
                  disabled={!editable}
                  onPress={() => onToggle(app, feature)}
                  testID={`feature-chip-${app}-${feature}`}>
                  {SwiftarrClientApp.getLabel(app)}
                </Chip>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};
