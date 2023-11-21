import {useTokenAuthQuery} from '../TokenAuthQuery';
import {RegistrationCodeUserData} from '../../../libraries/Structs/ControllerStructs';

export const useRegCodeForUserQuery = ({userID}: {userID: string}) => {
  return useTokenAuthQuery<RegistrationCodeUserData>({
    queryKey: [`/admin/regcodes/findbyuser/${userID}`],
  });
};
