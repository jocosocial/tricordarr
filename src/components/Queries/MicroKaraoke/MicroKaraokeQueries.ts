import {useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {MicroKaraokeCompletedSong} from '../../../libraries/Structs/ControllerStructs.tsx';

export const useMicroKaraokeSonglistQuery = () => {
  return useTokenAuthQuery<MicroKaraokeCompletedSong[]>('/microkaraoke/songlist');
};
