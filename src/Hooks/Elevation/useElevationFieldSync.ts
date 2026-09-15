import {useFormikContext} from 'formik';
import {useEffect} from 'react';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';

/**
 * Keeps a form's postAs-moderator/postAs-TwitarrTeam boolean fields in sync with the
 * screen's current elevation, so a `PrivilegedAccountButtons` picker (which drives
 * elevation directly) can still feed forms/mutations that read these fields by name.
 */
export const useElevationFieldSync = (moderatorField: string, twitarrTeamField: string) => {
  const {setFieldValue} = useFormikContext();
  const {asPrivilegedUser} = useElevation();

  useEffect(() => {
    setFieldValue(moderatorField, asPrivilegedUser === PrivilegedUserAccounts.moderator);
    setFieldValue(twitarrTeamField, asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam);
  }, [asPrivilegedUser, moderatorField, twitarrTeamField, setFieldValue]);
};
