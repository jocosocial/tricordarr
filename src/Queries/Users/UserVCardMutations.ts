import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

/**
 * Fetches a vCard (.vcf) for the given user from `GET /api/v3/users/:user_id/vcard`.
 * Requires auth, unlike the event ICS download, so this uses ServerQueryClient.
 */
export const useUserVCardDownloadMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const mutationFn = async (userID: string) => {
    const response = await ServerQueryClient.get<string>(`/users/${userID}/vcard`, {
      responseType: 'text',
      headers: {Accept: 'text/vcard'},
    });
    return response.data;
  };

  return useTokenAuthMutation(mutationFn);
};
