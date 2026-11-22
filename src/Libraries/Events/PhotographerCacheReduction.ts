import {EventData, UserHeader} from '#src/Structs/ControllerStructs';

/**
 * Set whether the current user is photographing an event, keeping `photographers` in step with
 * `userIsPhotographer`. Everything that reads the list (the event screen, the schedule's photographer
 * filters, list membership below) sees the change without a refetch. Without `selfHeader` (profile not
 * loaded yet) the user can still be removed but not added; the boolean still flips either way.
 */
export function withUserPhotographing(
  event: EventData,
  isPhotographer: boolean,
  selfHeader: UserHeader | undefined,
  currentUserID: string | null | undefined,
): EventData {
  if (!event.shutternautData) {
    return event;
  }
  const others = event.shutternautData.photographers.filter(p => p.userID !== currentUserID);
  const photographers = isPhotographer && selfHeader ? [...others, selfHeader] : others;
  return {...event, shutternautData: {...event.shutternautData, userIsPhotographer: isPhotographer, photographers}};
}

/** Whether anyone, including the current user, is photographing an event. */
const hasAnyPhotographer = (event: EventData) =>
  event.shutternautData?.userIsPhotographer === true || (event.shutternautData?.photographers.length ?? 0) > 0;

/**
 * True when a cached list's `cruiseday` param rules the event out. Either side being unknown never rules it out.
 */
const isOtherCruiseDay = (params: Record<string, unknown> | undefined, eventCruiseDay: number | undefined) => {
  const cruiseDayParam = params?.cruiseday as number | string | undefined;
  return cruiseDayParam !== undefined && eventCruiseDay !== undefined && Number(cruiseDayParam) !== eventCruiseDay;
};

/**
 * Whether an already-updated event belongs in an `/events` list filtered on `hasPhotographer`.
 * `hasPhotographer=true` (the Shutternaut Calendar) holds events with any photographer; `hasPhotographer=false`
 * holds flagged events nobody has taken. Undefined when the list isn't photographer-filtered or is for a
 * different cruise day.
 */
export function photographerListMembership(
  params: Record<string, unknown> | undefined,
  event: EventData,
  eventCruiseDay: number | undefined,
): boolean | undefined {
  if (params?.hasPhotographer === undefined || isOtherCruiseDay(params, eventCruiseDay)) {
    return undefined;
  }
  if (params.hasPhotographer === true || params.hasPhotographer === 'true') {
    return hasAnyPhotographer(event);
  }
  return event.shutternautData?.needsPhotographer === true && !hasAnyPhotographer(event);
}
