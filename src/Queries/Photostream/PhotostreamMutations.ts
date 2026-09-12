import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {PhotostreamImageData, PhotostreamUploadData} from '#src/Structs/ControllerStructs';

interface PhotostreamImageMutationProps {
  imageUploadData: PhotostreamUploadData;
}

export const usePhotostreamImageUploadMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({imageUploadData}: PhotostreamImageMutationProps) => {
    return await apiPost<PhotostreamImageData, PhotostreamUploadData>('/photostream/upload', imageUploadData);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Moderators can delete photostream photos. Authors cannot delete their own, so there is
 * no user-facing delete. Per cfry 2024/08/27: letting users delete increases the chance
 * people will try posting bad photos and quickly deleting them before they can be reported.
 *
 * Prefer `usePhotostreamModerationDeleteMutation` in `#src/Queries/Moderation/ModerationMutations`.
 */
