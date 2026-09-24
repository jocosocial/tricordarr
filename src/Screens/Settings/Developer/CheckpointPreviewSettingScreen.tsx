import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {DisabledView} from '#src/Components/Views/Static/DisabledView';
import {KrakenView} from '#src/Components/Views/Static/KrakenView';
import {MaintenanceModeView} from '#src/Components/Views/Static/MaintenanceModeView';
import {NoAccessView} from '#src/Components/Views/Static/NoAccessView';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {PreRegistrationView} from '#src/Components/Views/Static/PreRegistrationView';
import {CheckpointPreview} from '#src/Enums/CheckpointPreview';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

export type Props = StackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.checkpointPreviewSettingScreen
>;

/**
 * Renders the blocked state of one checkpoint. The checkpoints themselves gate on session or
 * server state that can't be faked from here, so the view each one renders when it blocks is
 * rendered directly.
 */
export const CheckpointPreviewSettingScreen = ({route}: Props) => {
  switch (route.params.preview) {
    case CheckpointPreview.loggedIn:
      return <NotLoggedInView />;
    case CheckpointPreview.preRegistration:
      return <PreRegistrationView />;
    case CheckpointPreview.disabledFeature:
      return <DisabledView />;
    case CheckpointPreview.kraken:
      return <KrakenView />;
    case CheckpointPreview.maintenanceMode:
      return <MaintenanceModeView />;
    case CheckpointPreview.noAccess:
      return <NoAccessView />;
  }
};
