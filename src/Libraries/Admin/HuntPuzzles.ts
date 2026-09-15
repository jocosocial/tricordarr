import {HuntPuzzleCreateData} from '#src/Structs/AdminControllerStructs';

/**
 * Parse the hunt-create puzzles JSON field into API payloads.
 * @throws Error when the JSON is invalid or not an array of puzzle objects.
 */
export const parseHuntPuzzlesJson = (raw: string): HuntPuzzleCreateData[] => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('Puzzles must be valid JSON.');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Puzzles must be a JSON array.');
  }
  return parsed.map((item, index) => parseOnePuzzle(item, index));
};

/**
 * Parse a hints map from a JSON object string.
 * @throws Error when the JSON is invalid or is not a string-to-string object.
 */
export const parseHintsJson = (raw: string): Record<string, string> => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {};
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('Hints must be valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Hints must be a JSON object of string keys to string values.');
  }
  const hints: Record<string, string> = {};
  Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      throw new Error(`Hint "${key}" must be a string.`);
    }
    hints[key] = value;
  });
  return hints;
};

/**
 * Format stored hints for the puzzle editor field.
 */
export const hintsToJson = (hints?: Record<string, string>): string => {
  if (!hints || Object.keys(hints).length === 0) {
    return '{}';
  }
  return JSON.stringify(hints, null, 2);
};

const parseOnePuzzle = (item: unknown, index: number): HuntPuzzleCreateData => {
  if (!item || typeof item !== 'object') {
    throw new Error(`Puzzle ${index + 1} must be an object.`);
  }
  const puzzle = item as Record<string, unknown>;
  if (typeof puzzle.title !== 'string' || typeof puzzle.body !== 'string' || typeof puzzle.answer !== 'string') {
    throw new Error(`Puzzle ${index + 1} needs title, body, and answer strings.`);
  }
  const hints =
    puzzle.hints && typeof puzzle.hints === 'object' && !Array.isArray(puzzle.hints)
      ? Object.fromEntries(
          Object.entries(puzzle.hints as Record<string, unknown>).map(([key, value]) => {
            if (typeof value !== 'string') {
              throw new Error(`Puzzle ${index + 1} hint "${key}" must be a string.`);
            }
            return [key, value];
          }),
        )
      : {};
  const data: HuntPuzzleCreateData = {
    title: puzzle.title,
    body: puzzle.body,
    answer: puzzle.answer,
    hints,
  };
  if (typeof puzzle.unlockTime === 'string' && puzzle.unlockTime.length > 0) {
    data.unlockTime = puzzle.unlockTime;
  }
  return data;
};
