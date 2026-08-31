import React, {useEffect, useState} from 'react';
import {Text} from 'react-native-paper';

import {AdminFeatureMatrix} from '#src/Components/Admin/AdminFeatureMatrix';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {
  computeFeatureDeltas,
  settingsUpdateFromFeatureDeltas,
  toggleFeaturePair,
} from '#src/Libraries/Admin/FeatureDisable';
import {useAdminSettingsUpdateMutation} from '#src/Queries/Admin/SettingsMutations';
import {useAdminSettingsQuery} from '#src/Queries/Admin/SettingsQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {SettingsAppFeaturePair} from '#src/Structs/AdminControllerStructs';

export const AdminFeaturesScreen = () => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminFeaturesScreenInner />
    </AdminAccessScreen>
  );
};

const AdminFeaturesScreenInner = () => {
  const {data, refetch, isLoading} = useAdminSettingsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const mutation = useAdminSettingsUpdateMutation();
  const {canEditSettings} = useAdminAccess();
  const {setSnackbarPayload} = useSnackbar();
  const [current, setCurrent] = useState<SettingsAppFeaturePair[]>([]);
  useAdminHelpButton();

  useEffect(() => {
    if (data) {
      setCurrent(data.disabledFeatures);
    }
  }, [data]);

  const handleToggle = (app: string, feature: string) => {
    setCurrent(previous => toggleFeaturePair(previous, app, feature));
  };

  const handleSave = () => {
    if (!data) {
      return;
    }
    const deltas = computeFeatureDeltas(data.disabledFeatures, current);
    mutation.mutate(settingsUpdateFromFeatureDeltas(data, deltas), {
      onSuccess: () => {
        setSnackbarPayload({message: 'Feature flags saved.', messageType: 'success'});
      },
    });
  };

  if (isLoading && !data) {
    return <LoadingView />;
  }

  const deltas = data
    ? computeFeatureDeltas(data.disabledFeatures, current)
    : {enableFeatures: [], disableFeatures: []};
  const hasChanges = deltas.enableFeatures.length + deltas.disableFeatures.length > 0;

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          {!canEditSettings && <Text>Feature flags are read-only. Only the admin account can change them.</Text>}
          <AdminFeatureMatrix disabledFeatures={current} onToggle={handleToggle} editable={canEditSettings} />
        </PaddedContentView>
        {canEditSettings && (
          <PaddedContentView>
            <PrimaryActionButton
              testID={'featuresSave-button'}
              buttonText={'Save Changes'}
              onPress={handleSave}
              disabled={!hasChanges || mutation.isPending}
              isLoading={mutation.isPending}
            />
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
