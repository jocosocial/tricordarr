/**
 * Swiftarr schedule locations carry deck/section detail ("Rolling Stone Lounge, Deck 2, Midship"). Room poster
 * links and the feedback filter work on the bare room name. This mirrors Swiftarr's `/admin/feedback/roomlist`,
 * which cuts at the first comma or open paren.
 */
export const getRoomName = (location: string): string => {
  const cut = location.search(/[,(]/);
  return (cut === -1 ? location : location.slice(0, cut)).trim();
};

const normalize = (value: string): string => value.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Resolve a freeform room name (from a room poster link) to one of the known room names. Poster names are
 * hand-entered, so try progressively looser matches: exact, then prefix, then substring, all case-insensitive
 * (e.g. "Stuyvesant" finds "Half Moon/Stuyvesant Room"). Returns undefined when nothing matches.
 */
export const matchRoomName = (query: string | undefined, rooms: string[]): string | undefined => {
  const needle = query ? normalize(query) : '';
  if (!needle) {
    return undefined;
  }
  const normalized = rooms.map(room => ({room, value: normalize(room)}));
  return (
    normalized.find(r => r.value === needle) ??
    normalized.find(r => r.value.startsWith(needle)) ??
    normalized.find(r => r.value.includes(needle))
  )?.room;
};
