import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {SettingsStackNavigator, SettingsStackParamList} from '#src/Navigation/Stacks/SettingsStackNavigator';
import {PerformerType} from '#src/Queries/Performer/PerformerQueries';
import {BoardgameCreateLfgScreen} from '#src/Screens/Boardgames/BoardgameCreateLfgScreen';
import {BoardgameExpansionsScreen} from '#src/Screens/Boardgames/BoardgameExpansionsScreen';
import {BoardgameListScreen} from '#src/Screens/Boardgames/BoardgameListScreen';
import {BoardgameRecommendScreen} from '#src/Screens/Boardgames/BoardgameRecommendScreen';
import {BoardgameScreen} from '#src/Screens/Boardgames/BoardgameScreen';
import {BoardgameSearchScreen} from '#src/Screens/Boardgames/BoardgameSearchScreen';
import {DailyThemeScreen} from '#src/Screens/Main/DailyThemeScreen';
import {DailyThemesScreen} from '#src/Screens/Main/DailyThemesScreen';
import {FaqScreen} from '#src/Screens/Main/FaqScreen';
import {MainConductScreen} from '#src/Screens/Main/MainConductScreen';
import {TodayScreen} from '#src/Screens/Main/TodayScreen';
import {MicroKaraokeListScreen} from '#src/Screens/MicroKaraoke/MicroKaraokeListScreen';
import {MicroKaraokeSongScreen} from '#src/Screens/MicroKaraoke/MicroKaraokeSongScreen';
import {PerformerListScreen} from '#src/Screens/Performer/PerformerListScreen';
import {PhotostreamImageCreateScreen} from '#src/Screens/Photostream/PhotostreamImageCreateScreen';
import {PhotostreamScreen} from '#src/Screens/Photostream/PhotostreamScreen';
import {UserDirectoryScreen} from '#src/Screens/User/UserDirectoryScreen';
import {BoardgameData, DailyThemeData} from '#src/Structs/ControllerStructs';

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
  PhotostreamScreen: undefined;
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
};

export const MainStack = createStackNavigator<MainStackParamList>();

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
}

export const MainStackNavigator = () => {
  const {screenOptions} = useStyles();

  return (
    <MainStack.Navigator initialRouteName={MainStackComponents.mainScreen} screenOptions={screenOptions}>
      <MainStack.Screen name={MainStackComponents.mainScreen} component={TodayScreen} options={{title: 'Today'}} />
      <MainStack.Screen
        name={MainStackComponents.mainSettingsScreen}
        component={SettingsStackNavigator}
        options={{headerShown: false}}
      />
      <MainStack.Screen name={MainStackComponents.faqScreen} component={FaqScreen} options={{title: 'FAQ'}} />
      <MainStack.Screen
        name={MainStackComponents.userDirectoryScreen}
        component={UserDirectoryScreen}
        options={{title: 'Directory'}}
      />
      <MainStack.Screen
        name={MainStackComponents.dailyThemeScreen}
        component={DailyThemeScreen}
        options={{title: 'Daily Theme'}}
      />
      <MainStack.Screen
        name={MainStackComponents.conductScreen}
        component={MainConductScreen}
        options={{title: 'Code of Conduct'}}
      />
      <MainStack.Screen
        name={MainStackComponents.dailyThemesScreen}
        component={DailyThemesScreen}
        options={{title: 'Daily Themes'}}
      />
      <MainStack.Screen
        name={MainStackComponents.photostreamScreen}
        component={PhotostreamScreen}
        options={{title: 'Photo Stream'}}
      />
      <MainStack.Screen
        name={MainStackComponents.photostreamImageCreateScreen}
        component={PhotostreamImageCreateScreen}
        options={{title: 'Upload'}}
      />
      <MainStack.Screen
        name={MainStackComponents.microKaraokeListScreen}
        component={MicroKaraokeListScreen}
        options={{title: 'Song List'}}
      />
      <MainStack.Screen
        name={MainStackComponents.microKaraokeSongScreen}
        component={MicroKaraokeSongScreen}
        options={{title: 'Song'}}
      />
      <MainStack.Screen
        name={MainStackComponents.performerListScreen}
        component={PerformerListScreen}
        options={{title: 'Performers'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameListScreen}
        component={BoardgameListScreen}
        options={{title: 'Board Games'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameScreen}
        component={BoardgameScreen}
        options={{title: 'Board Game'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameSearchScreen}
        component={BoardgameSearchScreen}
        options={{title: 'Search'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameRecommendScreen}
        component={BoardgameRecommendScreen}
        options={{title: 'Game Guide'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameExpansionsScreen}
        component={BoardgameExpansionsScreen}
        options={{title: 'Expansions'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameCreateLfgScreen}
        component={BoardgameCreateLfgScreen}
        options={{title: 'Create LFG'}}
      />
      {CommonScreens(MainStack)}
    </MainStack.Navigator>
  );
};

export const useMainStack = () => useNavigation<StackNavigationProp<MainStackParamList>>();
