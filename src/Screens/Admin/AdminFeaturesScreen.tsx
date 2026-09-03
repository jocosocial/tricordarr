import React, {useEffect, useState} from 'react';

import {AdminFeatureMatrix} from '#src/Components/Admin/AdminFeatureMatrix';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ServerSettingsReadOnlyWarningView} from '#src/Components/Views/Warnings/ServerSettingsReadOnlyWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {
  computeFeatureDeltas,
  settingsUpdateFromFeatureDeltas,
  toggleFeaturePair,
} from '#src/Libraries/Admin/FeatureDisable';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
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
  useAdminHelpButton(CommonStackComponents.disabledHelpScreen);

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
      <ServerSettingsReadOnlyWarningView />
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <AdminFeatureMatrix disabledFeatures={current} onToggle={handleToggle} editable={canEditSettings} />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'featuresSave-button'}
            buttonText={'Save Changes'}
            onPress={handleSave}
            disabled={!canEditSettings || !hasChanges || mutation.isPending}
            isLoading={mutation.isPending}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
