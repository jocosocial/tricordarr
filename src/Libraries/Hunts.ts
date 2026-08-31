import {HuntPuzzleCallInResultData, HuntPuzzleDetailData} from '#src/Structs/ControllerStructs';

/**
 * True when the current user has a correct call-in on this puzzle.
 */
export const huntPuzzleIsSolved = (puzzle: HuntPuzzleDetailData): boolean => {
  return puzzle.callIns.some(callIn => !!callIn.correct);
};

/**
 * User-facing result label for a call-in attempt.
 */
export const getHuntCallInResultLabel = (callIn: HuntPuzzleCallInResultData): string => {
  if (callIn.correct) {
    return 'Correct!';
  }
  if (callIn.hint) {
    return callIn.hint;
  }
  return 'Incorrect';
};
