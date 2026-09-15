import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {UserHeader} from '#src/Structs/ControllerStructs';

export const useModeratorsQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/admin/moderators', options);
};

export const useTwitarrTeamQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/admin/twitarrteam', options);
};

export const useTHOQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/admin/tho', options);
};
