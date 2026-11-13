/**
 * Where the user is physically located during OOBE, as chosen on OobeLocationScreen.
 * Drives which server URL gets pre-populated; it does NOT set preRegistrationMode -
 * that is derived later from the server's own ClientSettingsData.enablePreregistration.
 */
export enum OobeLocation {
  land = 'land',
  ship = 'ship',
}
