import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {DisabledView} from '#src/Components/Views/Static/DisabledView';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonScreens, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {SettingsStackNavigator, SettingsStackParamList} from '#src/Navigation/Stacks/SettingsStackNavigator';
import {PerformerType} from '#src/Queries/Performer/PerformerQueries';
import {BoardgameCreateLfgScreen} from '#src/Screens/Boardgames/BoardgameCreateLfgScreen';
import {BoardgameExpansionsScreen} from '#src/Screens/Boardgames/BoardgameExpansionsScreen';
import {BoardgameHelpScreen} from '#src/Screens/Boardgames/BoardgameHelpScreen';
import {BoardgameListScreen} from '#src/Screens/Boardgames/BoardgameListScreen';
import {BoardgameRecommendScreen} from '#src/Screens/Boardgames/BoardgameRecommendScreen';
import {BoardgameScreen} from '#src/Screens/Boardgames/BoardgameScreen';
import {BoardgameSearchScreen} from '#src/Screens/Boardgames/BoardgameSearchScreen';
import {AboutTricordarrScreen} from '#src/Screens/Main/AboutTricordarrScreen';
import {AboutTwitarrScreen} from '#src/Screens/Main/AboutTwitarrScreen';
import {DailyThemeScreen} from '#src/Screens/Main/DailyThemeScreen';
import {DailyThemesScreen} from '#src/Screens/Main/DailyThemesScreen';
import {FaqScreen} from '#src/Screens/Main/FaqScreen';
import {MainConductScreen} from '#src/Screens/Main/MainConductScreen';
import {MainHelpScreen} from '#src/Screens/Main/MainHelpScreen';
import {TodayScreen} from '#src/Screens/Main/TodayScreen';
import {MicroKaraokeListScreen} from '#src/Screens/MicroKaraoke/MicroKaraokeListScreen';
import {MicroKaraokeSongScreen} from '#src/Screens/MicroKaraoke/MicroKaraokeSongScreen';
import {PerformerListScreen} from '#src/Screens/Performer/PerformerListScreen';
import {PhotostreamHelpScreen} from '#src/Screens/Photostream/PhotostreamHelpScreen';
import {PhotostreamImageCreateScreen} from '#src/Screens/Photostream/PhotostreamImageCreateScreen';
import {PhotostreamScreen} from '#src/Screens/Photostream/PhotostreamScreen';
import {UserDirectoryScreen} from '#src/Screens/User/UserDirectoryScreen';
import {BoardgameData, DailyThemeData} from '#src/Structs/ControllerStructs';

export type MainStackParamList = CommonStackParamList & {
  MainScreen: undefined;
  MainSettingsScreen: NavigatorScreenParams<SettingsStackParamList>;
  AboutTwitarrScreen: undefined;
  AboutTricordarrScreen: undefined;
  FaqScreen: undefined;
  UserDirectoryScreen: undefined;
  DailyThemeScreen: {
    dailyTheme: DailyThemeData;
  };
  MainHelpScreen: undefined;
  MainConductScreen: undefined;
  DailyThemesScreen: undefined;
  PhotostreamScreen: undefined;
  PhotostreamImageCreateScreen: undefined;
  PhotostreamHelpScreen: undefined;
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
  BoardgameHelpScreen: undefined;
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
  aboutTwitarrScreen = 'AboutTwitarrScreen',
  aboutTricordarrScreen = 'AboutTricordarrScreen',
  faqScreen = 'FaqScreen',
  userDirectoryScreen = 'UserDirectoryScreen',
  dailyThemeScreen = 'DailyThemeScreen',
  mainHelpScreen = 'MainHelpScreen',
  conductScreen = 'MainConductScreen',
  dailyThemesScreen = 'DailyThemesScreen',
  photostreamScreen = 'PhotostreamScreen',
  photostreamImageCreateScreen = 'PhotostreamImageCreateScreen',
  photostreamHelpScreen = 'PhotostreamHelpScreen',
  microKaraokeListScreen = 'MicroKaraokeListScreen',
  microKaraokeSongScreen = 'MicroKaraokeSongScreen',
  performerListScreen = 'PerformerListScreen',
  boardgameListScreen = 'BoardgameListScreen',
  boardgameScreen = 'BoardgameScreen',
  boardgameHelpScreen = 'BoardgameHelpScreen',
  boardgameRecommendScreen = 'BoardgameRecommendScreen',
  boardgameSearchScreen = 'BoardgameSearchScreen',
  boardgameExpansionsScreen = 'BoardgameExpansionsScreen',
  boardgameCreateLfgScreen = 'BoardgameCreateLfgScreen',
}

export const MainStackNavigator = () => {
  const {screenOptions} = useStyles();
  const {getIsDisabled} = useFeature();
  const isUsersDisabled = getIsDisabled(SwiftarrFeature.users);
  const isPerformersDisabled = getIsDisabled(SwiftarrFeature.performers);
  const isPhotostreamDisabled = getIsDisabled(SwiftarrFeature.photostream);
  const isMicroKaraokeDisabled = getIsDisabled(SwiftarrFeature.microkaraoke);
  const isGamesDisabled = getIsDisabled(SwiftarrFeature.gameslist);

  return (
    <MainStack.Navigator initialRouteName={MainStackComponents.mainScreen} screenOptions={screenOptions}>
      <MainStack.Screen name={MainStackComponents.mainScreen} component={TodayScreen} options={{title: 'Today'}} />
      <MainStack.Screen
        name={MainStackComponents.mainSettingsScreen}
        component={SettingsStackNavigator}
        options={{headerShown: false}}
      />
      <MainStack.Screen
        name={MainStackComponents.aboutTricordarrScreen}
        component={AboutTricordarrScreen}
        options={{title: 'About Tricordarr'}}
      />
      <MainStack.Screen
        name={MainStackComponents.aboutTwitarrScreen}
        component={AboutTwitarrScreen}
        options={{title: 'About Twitarr'}}
      />
      <MainStack.Screen name={MainStackComponents.faqScreen} component={FaqScreen} options={{title: 'FAQ'}} />
      <MainStack.Screen
        name={MainStackComponents.userDirectoryScreen}
        component={isUsersDisabled ? DisabledView : UserDirectoryScreen}
        options={{title: 'Directory'}}
      />
      <MainStack.Screen
        name={MainStackComponents.dailyThemeScreen}
        component={DailyThemeScreen}
        options={{title: 'Daily Theme'}}
      />
      <MainStack.Screen
        name={MainStackComponents.mainHelpScreen}
        component={MainHelpScreen}
        options={{title: 'Help'}}
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
        component={isPhotostreamDisabled ? DisabledView : PhotostreamScreen}
        options={{title: 'Photo Stream'}}
      />
      <MainStack.Screen
        name={MainStackComponents.photostreamImageCreateScreen}
        component={isPhotostreamDisabled ? DisabledView : PhotostreamImageCreateScreen}
        options={{title: 'Upload'}}
      />
      <MainStack.Screen
        name={MainStackComponents.photostreamHelpScreen}
        component={PhotostreamHelpScreen}
        options={{title: 'Help'}}
      />
      <MainStack.Screen
        name={MainStackComponents.microKaraokeListScreen}
        component={isMicroKaraokeDisabled ? DisabledView : MicroKaraokeListScreen}
        options={{title: 'Song List'}}
      />
      <MainStack.Screen
        name={MainStackComponents.microKaraokeSongScreen}
        component={isMicroKaraokeDisabled ? DisabledView : MicroKaraokeSongScreen}
        options={{title: 'Song'}}
      />
      <MainStack.Screen
        name={MainStackComponents.performerListScreen}
        component={isPerformersDisabled ? DisabledView : PerformerListScreen}
        options={{title: 'Performers'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameListScreen}
        component={isGamesDisabled ? DisabledView : BoardgameListScreen}
        options={{title: 'Board Games'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameScreen}
        component={isGamesDisabled ? DisabledView : BoardgameScreen}
        options={{title: 'Board Game'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameHelpScreen}
        component={isGamesDisabled ? DisabledView : BoardgameHelpScreen}
        options={{title: 'Board Game Help'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameSearchScreen}
        component={isGamesDisabled ? DisabledView : BoardgameSearchScreen}
        options={{title: 'Search'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameRecommendScreen}
        component={isGamesDisabled ? DisabledView : BoardgameRecommendScreen}
        options={{title: 'Game Guide'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameExpansionsScreen}
        component={isGamesDisabled ? DisabledView : BoardgameExpansionsScreen}
        options={{title: 'Expansions'}}
      />
      <MainStack.Screen
        name={MainStackComponents.boardgameCreateLfgScreen}
        component={isGamesDisabled ? DisabledView : BoardgameCreateLfgScreen}
        options={{title: 'Create LFG'}}
      />
      {CommonScreens(MainStack)}
    </MainStack.Navigator>
  );
};

export const useMainStack = () => useNavigation<StackNavigationProp<MainStackParamList>>();
