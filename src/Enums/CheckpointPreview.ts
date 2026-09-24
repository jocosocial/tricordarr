/**
 * Blocked states of the checkpoint screens (`src/Screens/Checkpoint`), used by the developer
 * Checkpoints previews.
 */
export enum CheckpointPreview {
  loggedIn = 'loggedIn',
  preRegistration = 'preRegistration',
  disabledFeature = 'disabledFeature',
  kraken = 'kraken',
  maintenanceMode = 'maintenanceMode',
  noAccess = 'noAccess',
}

export namespace CheckpointPreview {
  /**
   * Every preview, in the order the developer list shows them. Object.values() can't be used
   * here because this namespace's own functions would come along with the enum members.
   */
  export const getAll = (): CheckpointPreview[] => [
    CheckpointPreview.loggedIn,
    CheckpointPreview.preRegistration,
    CheckpointPreview.disabledFeature,
    CheckpointPreview.kraken,
    CheckpointPreview.maintenanceMode,
    CheckpointPreview.noAccess,
  ];

  /**
   * Checkpoint that renders this preview.
   */
  export const getTitle = (preview: CheckpointPreview): string => {
    switch (preview) {
      case CheckpointPreview.loggedIn:
        return 'LoggedInScreen';
      case CheckpointPreview.preRegistration:
        return 'PreRegistrationScreen';
      case CheckpointPreview.disabledFeature:
        return 'DisabledFeatureScreen';
      case CheckpointPreview.kraken:
        return 'DisabledFeatureScreen (Kraken)';
      case CheckpointPreview.maintenanceMode:
        return 'MaintenanceModeScreen';
      case CheckpointPreview.noAccess:
        return 'NoAccessScreen';
    }
  };

  /**
   * What the checkpoint blocks on, and which view it renders when it does.
   */
  export const getDescription = (preview: CheckpointPreview): string => {
    switch (preview) {
      case CheckpointPreview.loggedIn:
        return 'Shown to logged out users. Renders NotLoggedInView.';
      case CheckpointPreview.preRegistration:
        return 'Shown while the server is in pre-registration mode. Renders PreRegistrationView.';
      case CheckpointPreview.disabledFeature:
        return 'Shown when a feature is disabled for this app. Renders DisabledView.';
      case CheckpointPreview.kraken:
        return 'Shown on iOS when a feature is only available in The Kraken. Renders KrakenView.';
      case CheckpointPreview.maintenanceMode:
        return 'Shown when the server restricts access below your access level. Renders MaintenanceModeView.';
      case CheckpointPreview.noAccess:
        return 'Shown when you lack a required privilege or role. Renders NoAccessView.';
    }
  };
}
