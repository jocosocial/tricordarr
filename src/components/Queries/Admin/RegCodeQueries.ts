import {useTokenAuthQuery} from '../TokenAuthQuery';
import {RegistrationCodeUserData} from '../../../Libraries/Structs/ControllerStructs';

export const useRegCodeForUserQuery = ({userID}: {userID: string}) => {
  return useTokenAuthQuery<RegistrationCodeUserData>(`/admin/regcodes/findbyuser/${userID}`);
};
