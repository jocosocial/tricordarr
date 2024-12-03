import {useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {MicroKaraokeCompletedSong, MicroKaraokeSongManifest} from '../../../libraries/Structs/ControllerStructs.tsx';

export const useMicroKaraokeSonglistQuery = () => {
  return useTokenAuthQuery<MicroKaraokeCompletedSong[]>('/microkaraoke/songlist');
};

export const useMicroKaraokeSongQuery = (songID: number) => {
  return useTokenAuthQuery<MicroKaraokeSongManifest>(`/microkaraoke/song/${songID}`);
};
