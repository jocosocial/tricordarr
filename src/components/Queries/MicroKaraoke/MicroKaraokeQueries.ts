import {useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {MicroKaraokeCompletedSong, MicroKaraokeSongManifest} from '../../../Libraries/Structs/ControllerStructs.tsx';

export const useMicroKaraokeSonglistQuery = () => {
  return useTokenAuthQuery<MicroKaraokeCompletedSong[]>('/microkaraoke/songlist');
};

export const useMicroKaraokeSongQuery = (songID: number, enabled = true) => {
  return useTokenAuthQuery<MicroKaraokeSongManifest>(`/microkaraoke/song/${songID}`, {
    enabled: enabled,
  });
};
