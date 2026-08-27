/**
 * How timezone identifiers are shown next to event and schedule times.
 */
export enum TimeZoneLabelMode {
  offset = 'offset',
  abbreviation = 'abbreviation',
  hidden = 'hidden',
}

export namespace TimeZoneLabelMode {
  /**
   * Short label for settings UI (segmented buttons).
   */
  export const getLabel = (mode?: TimeZoneLabelMode) => {
    switch (mode) {
      case TimeZoneLabelMode.offset:
        return 'Offset';
      case TimeZoneLabelMode.abbreviation:
        return 'Abbrev';
      case TimeZoneLabelMode.hidden:
        return 'Hidden';
      default:
        return 'Offset';
    }
  };
}
