import {createContext, useContext} from 'react';

interface OobeContextType {
  oobeCompleted: boolean;
  /** Device-level completed version; 0 if never completed. */
  oobeCompletedVersion: number;
  oobeFinish: () => void;
  setOobeCompletedVersion: (version: number) => Promise<void>;
  /**
   * A setup flow (first run or boarding) has just changed the session and the steps after that
   * (permissions, finish) are still to come. The session change remounts the navigators, so the setup stack reads this
   * to start where the flow left off instead of at the welcome screen.
   */
  resumeAfterCommit: boolean;
  setResumeAfterCommit: (value: boolean) => void;
}

export const OobeContext = createContext<OobeContextType>({
  oobeCompleted: false,
  oobeCompletedVersion: 0,
  oobeFinish: () => {},
  setOobeCompletedVersion: async () => {},
  resumeAfterCommit: false,
  setResumeAfterCommit: () => {},
});

export const useOobe = () => useContext(OobeContext);
