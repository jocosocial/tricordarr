import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {PerformerData, PerformerUploadData} from '#src/Structs/ControllerStructs';

/**
 * Create or update the current user's performer profile. With an `eventID` this goes through
 * `/performer/forevent/:eventID`, which also attaches the profile to that (Shadow) event. Without
 * one it goes through `/performer/self`, which only role holders and TwitarrTeam may use.
 *
 * Both endpoints return a bare HTTP status with no body, so the handler follows up with a GET of
 * `/performer/self` and returns that. Callers get a complete PerformerData for the cache reducer.
 */
export const usePerformerUpsertMutation = () => {
  const {apiPost, apiGet} = useSwiftarrQueryClient();

  interface QueryHandlerProps {
    eventID?: string;
    performerData: PerformerUploadData;
  }

  const queryHandler = async (props: QueryHandlerProps) => {
    const url = props.eventID ? `/performer/forevent/${props.eventID}` : '/performer/self';
    await apiPost<void, PerformerUploadData>(url, props.performerData);
    return await apiGet<PerformerData, undefined>('/performer/self');
  };

  return useTokenAuthMutation(queryHandler);
};

export const usePerformerDeleteForEventMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  interface QueryHandlerProps {
    eventID: string;
  }

  const queryHandler = async (props: QueryHandlerProps) => {
    return await apiDelete(`/performer/forevent/${props.eventID}`);
  };

  return useTokenAuthMutation(queryHandler);
};

export const usePerformerDeleteMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  interface QueryHandlerProps {
    performerID?: string;
  }

  // Deleting self is a user thing. Deleting by ID is a Moderator thing.
  const queryHandler = async ({performerID = 'self'}: QueryHandlerProps) => {
    return await apiDelete(`/performer/${performerID}`);
  };

  return useTokenAuthMutation(queryHandler);
};

interface PerformerEventLinkProps {
  performerID: string;
  eventID: string;
}

/**
 * TwitarrTeam: manually link any performer (official or shadow) to any event. Manual links
 * are kept when the official performer spreadsheet is re-imported.
 */
export const usePerformerEventLinkMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({performerID, eventID}: PerformerEventLinkProps) => {
    return await apiPost(`/admin/performer/${performerID}/event/${eventID}`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * TwitarrTeam: unlink a performer from an event, whether the link was manual or imported.
 */
export const usePerformerEventUnlinkMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  const queryHandler = async ({performerID, eventID}: PerformerEventLinkProps) => {
    return await apiDelete(`/admin/performer/${performerID}/event/${eventID}`);
  };

  return useTokenAuthMutation(queryHandler);
};
