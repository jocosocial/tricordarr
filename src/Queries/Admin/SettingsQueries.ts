import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {SettingsAdminData} from '#src/Structs/AdminControllerStructs';

export const useAdminSettingsQuery = (options = {}) => {
  return useTokenAuthQuery<SettingsAdminData>('/admin/serversettings', options);
};
