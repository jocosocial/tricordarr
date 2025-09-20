import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation.ts';
import {NoteCreateData, NoteData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext.ts';

interface UserNoteCreateMutationProps {
  userID: string;
  noteData: NoteCreateData;
}

export const useUserNoteCreateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const createQueryHandler = async ({userID, noteData}: UserNoteCreateMutationProps) => {
    return await apiPost<NoteData, NoteCreateData>(`/users/${userID}/note`, noteData);
  };

  return useTokenAuthMutation(createQueryHandler);
};

export const useUserNoteDeleteMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();

  const deleteQueryHandler = async ({userID}: {userID: string}) => {
    return await apiDelete(`/users/${userID}/note`);
  };

  return useTokenAuthMutation(deleteQueryHandler);
};
