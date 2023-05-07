import React, {useState, PropsWithChildren, useCallback} from 'react';
import {FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {TwitarrContext} from '../Contexts/TwitarrContext';
import {InfiniteData} from '@tanstack/react-query';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const [fez, setFez] = useState<FezData>();
  const [fezList, setFezList] = useState<FezListData>();
  const [fezPageData, setFezPageData] = useState<InfiniteData<FezData>>();

  /**
   * Generic function to update the fezzes in the fezList.
   */
  const updateFezList = useCallback(
    (callback: (f: FezData) => FezData) => {
      if (fezList) {
        const newFezzes = fezList.fezzes.flatMap(callback);
        setFezList({
          ...fezList,
          fezzes: newFezzes,
        });
      }
    },
    [fezList],
  );

  /**
   * Mark a particular fez as read in the list. The API does this in the server under the hood when the
   * fez is GET'd (with appropriate pagination to ensure reading the new posts).
   */
  const markFezRead = useCallback(
    (fezID: string) => {
      updateFezList(f => {
        if (f.fezID === fezID && f.members) {
          f.members.readCount = f.members.postCount;
        }
        return f;
      });
    },
    [updateFezList],
  );

  /**
   * Increment the post count (and thus the unread count) for a fez in the list. The API does this under
   * the hood when a new message is posted to the fez.
   */
  const incrementFezPostCount = useCallback(
    (fezID: string) => {
      updateFezList(f => {
        if (f.fezID === fezID && f.members) {
          f.members.postCount = f.members.postCount + 1;
          f.lastModificationTime = new Date();
        }
        return f;
      });
    },
    [updateFezList],
  );

  return (
    <TwitarrContext.Provider
      value={{
        fez,
        setFez,
        fezList,
        setFezList,
        markFezRead,
        incrementFezPostCount,
        fezPageData,
        setFezPageData,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
