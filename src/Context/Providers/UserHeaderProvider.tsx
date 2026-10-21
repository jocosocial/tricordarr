import React, {PropsWithChildren} from 'react';

import {UserHeaderContext, UserHeaderContextType} from '#src/Context/Contexts/UserHeaderContext';
import {UserHeader} from '#src/Structs/ControllerStructs';

const contains = (headers: UserHeader[] = [], header: UserHeader) => {
  return headers.map(h => h.userID).includes(header.userID);
};

const userHeaderContextValue: UserHeaderContextType = {contains};

export const UserHeaderProvider = ({children}: PropsWithChildren) => {
  return <UserHeaderContext.Provider value={userHeaderContextValue}>{children}</UserHeaderContext.Provider>;
};
