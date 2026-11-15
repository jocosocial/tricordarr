import {createContext, useContext} from 'react';

import {OnboardingMode} from '#src/Types/RouteParams';

interface OobeContextType {
  oobeCompleted: boolean;
  /** Device-level completed version; 0 if never completed. */
  oobeCompletedVersion: number;
  oobeFinish: () => void;
  setOobeCompletedVersion: (version: number) => Promise<void>;
  /**
   * The mode of a setup flow that has just changed the session and still has steps to come (the
   * session step, and for first run and boarding permissions and finish). The session change
   * remounts the navigators, so the setup stack reads this to start where the flow left off instead
   * of at the welcome screen. Null when no flow is resuming.
   */
  resumeMode: OnboardingMode | null;
  setResumeMode: (mode: OnboardingMode | null) => void;
}

export const OobeContext = createContext<OobeContextType>({
  oobeCompleted: false,
  oobeCompletedVersion: 0,
  oobeFinish: () => {},
  setOobeCompletedVersion: async () => {},
  resumeMode: null,
  setResumeMode: () => {},
});

export const useOobe = () => useContext(OobeContext);
