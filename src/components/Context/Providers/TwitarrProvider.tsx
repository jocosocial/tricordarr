import React, {useState, PropsWithChildren} from 'react';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {TwitarrContext} from '../Contexts/TwitarrContext';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const [fez, setFez] = useState<FezData>();

  return (
    <TwitarrContext.Provider
      value={{
        fez,
        setFez,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
