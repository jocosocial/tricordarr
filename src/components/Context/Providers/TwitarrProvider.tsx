import React, {useState, PropsWithChildren} from 'react';
import {FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {TwitarrContext} from '../Contexts/TwitarrContext';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const [fez, setFez] = useState<FezData>();
  const [fezList, setFezList] = useState<FezListData>();

  return (
    <TwitarrContext.Provider
      value={{
        fez,
        setFez,
        fezList,
        setFezList,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
