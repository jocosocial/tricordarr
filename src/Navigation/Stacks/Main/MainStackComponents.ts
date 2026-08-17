import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {SettingsStackParamList} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
import {PerformerType} from '#src/Queries/Performer/PerformerQueries';
import {BoardgameData, DailyThemeData} from '#src/Structs/ControllerStructs';
import {Optional, WithScrollToTopIntent} from '#src/Types/RouteParams';

export type MainStackParamList = CommonStackParamList & {
  MainScreen: undefined;
  MainSettingsScreen: NavigatorScreenParams<SettingsStackParamList>;
  FaqScreen: undefined;
  UserDirectoryScreen: undefined;
  DailyThemeScreen: {
    dailyTheme: DailyThemeData;
  };
  MainConductScreen: undefined;
  DailyThemesScreen: undefined;
  PhotostreamScreen: Optional<WithScrollToTopIntent>;
  PhotostreamImageCreateScreen: undefined;
  MicroKaraokeListScreen: undefined;
  MicroKaraokeSongScreen: {
    songID: number;
  };
  PerformerListScreen: {
    performerType?: PerformerType;
  };
  BoardgameListScreen: undefined;
  BoardgameScreen: {
    boardgame: BoardgameData;
  };
  BoardgameRecommendScreen: undefined;
  BoardgameSearchScreen: undefined;
  BoardgameExpansionsScreen: {
    boardgameID: string;
  };
  BoardgameCreateLfgScreen: {
    boardgame: BoardgameData;
  };
  KaraokePerformanceListScreen: undefined;
  KaraokeSearchScreen: undefined;
  KaraokeFavoritesListScreen: undefined;
  KaraokeLogPerformanceScreen: {
    songID: string;
    artist: string;
    songName: string;
  };
};

export enum MainStackComponents {
  mainScreen = 'MainScreen',
  mainSettingsScreen = 'MainSettingsScreen',
  faqScreen = 'FaqScreen',
  userDirectoryScreen = 'UserDirectoryScreen',
  dailyThemeScreen = 'DailyThemeScreen',
  conductScreen = 'MainConductScreen',
  dailyThemesScreen = 'DailyThemesScreen',
  photostreamScreen = 'PhotostreamScreen',
  photostreamImageCreateScreen = 'PhotostreamImageCreateScreen',
  microKaraokeListScreen = 'MicroKaraokeListScreen',
  microKaraokeSongScreen = 'MicroKaraokeSongScreen',
  performerListScreen = 'PerformerListScreen',
  boardgameListScreen = 'BoardgameListScreen',
  boardgameScreen = 'BoardgameScreen',
  boardgameRecommendScreen = 'BoardgameRecommendScreen',
  boardgameSearchScreen = 'BoardgameSearchScreen',
  boardgameExpansionsScreen = 'BoardgameExpansionsScreen',
  boardgameCreateLfgScreen = 'BoardgameCreateLfgScreen',
  karaokePerformanceListScreen = 'KaraokePerformanceListScreen',
  karaokeSearchScreen = 'KaraokeSearchScreen',
  karaokeFavoritesListScreen = 'KaraokeFavoritesListScreen',
  karaokeLogPerformanceScreen = 'KaraokeLogPerformanceScreen',
}

export const useMainStack = () => useNavigation<StackNavigationProp<MainStackParamList>>();
