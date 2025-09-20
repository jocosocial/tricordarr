import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {MicroKaraokeCompletedSong, MicroKaraokeSongManifest} from '#src/Structs/ControllerStructs';

export const useMicroKaraokeSonglistQuery = () => {
  return useTokenAuthQuery<MicroKaraokeCompletedSong[]>('/microkaraoke/songlist');
};

export const useMicroKaraokeSongQuery = (songID: number, enabled = true) => {
  return useTokenAuthQuery<MicroKaraokeSongManifest>(`/microkaraoke/song/${songID}`, {
    enabled: enabled,
  });
};
