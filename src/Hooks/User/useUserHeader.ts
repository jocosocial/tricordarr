import {UserHeader} from '#src/Structs/ControllerStructs';

export const useUserHeader = () => {
  const contains = (headers: UserHeader[] = [], header: UserHeader) => {
    return headers.map(h => h.userID).includes(header.userID);
  };

  return {contains};
};
