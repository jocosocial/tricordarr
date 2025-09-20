import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {RegistrationCodeUserData} from '#src/Structs/ControllerStructs';

export const useRegCodeForUserQuery = ({userID}: {userID: string}) => {
  return useTokenAuthQuery<RegistrationCodeUserData>(`/admin/regcodes/findbyuser/${userID}`);
};
