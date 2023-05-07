import React, {useState, PropsWithChildren} from 'react';
import {FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {TwitarrContext} from '../Contexts/TwitarrContext';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const [fez, setFez] = useState<FezData>();
  const [fezList, setFezList] = useState<FezListData>();

  /**
   * Mark a particular fez as read in the list. The API does this in the server under the hood when the
   * fez is GET'd (with appropriate pagination to ensure reading the new posts.
   */
  const markFezRead = (fezID: string) => {
    if (fezList) {
      fezList.fezzes = fezList.fezzes.flatMap(f => {
        if (f.fezID === fezID && f.members) {
          f.members.readCount = f.members.postCount;
        }
        return f;
      });
      setFezList(fezList);
    }
  };

  return (
    <TwitarrContext.Provider
      value={{
        fez,
        setFez,
        fezList,
        setFezList,
        markFezRead,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
