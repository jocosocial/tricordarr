import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {TodayScreen} from '../../Screens/Main/TodayScreen.tsx';
import {SettingsStackNavigator, SettingsStackParamList} from './SettingsStackNavigator.tsx';
import {AboutTricordarrScreen} from '../../Screens/Main/AboutTricordarrScreen.tsx';
import {UserDirectoryScreen} from '../../Screens/User/UserDirectoryScreen.tsx';
import {BoardgameData, DailyThemeData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useFeature} from '../../Context/Contexts/FeatureContext.ts';
import {SwiftarrFeature} from '../../../Libraries/Enums/AppFeatures.ts';
import {DisabledView} from '../../Views/Static/DisabledView.tsx';
import {DailyThemeScreen} from '../../Screens/Main/DailyThemeScreen.tsx';
import {MainHelpScreen} from '../../Screens/Main/MainHelpScreen.tsx';
import {MainConductScreen} from '../../Screens/Main/MainConductScreen.tsx';
import {DailyThemesScreen} from '../../Screens/Main/DailyThemesScreen.tsx';
import {CommonScreens, CommonStackParamList} from '../CommonScreens.tsx';
import {PhotostreamScreen} from '../../Screens/Photostream/PhotostreamScreen.tsx';
import {PhotostreamImageCreateScreen} from '../../Screens/Photostream/PhotostreamImageCreateScreen.tsx';
import {PhotostreamHelpScreen} from '../../Screens/Photostream/PhotostreamHelpScreen.tsx';
import {MicroKaraokeListScreen} from '../../Screens/MicroKaraoke/MicroKaraokeListScreen.tsx';
import {MicroKaraokeSongScreen} from '../../Screens/MicroKaraoke/MicroKaraokeSongScreen.tsx';
import {PerformerListScreen} from '../../Screens/Performer/PerformerListScreen.tsx';
import {PerformerType} from '../../Queries/Performer/PerformerQueries.ts';
import {BoardgameListScreen} from '../../Screens/Boardgames/BoardgameListScreen.tsx';
import {BoardgameScreen} from '../../Screens/Boardgames/BoardgameScreen.tsx';
import {BoardgameHelpScreen} from '../../Screens/Boardgames/BoardgameHelpScreen.tsx';
import {BoardgameRecommendScreen} from '../../Screens/Boardgames/BoardgameRecommendScreen.tsx';
import {BoardgameSearchScreen} from '../../Screens/Boardgames/BoardgameSearchScreen.tsx';
import {BoardgameExpansionsScreen} from '../../Screens/Boardgames/BoardgameExpansionsScreen.tsx';
import {BoardgameCreateLfgScreen} from '../../Screens/Boardgames/BoardgameCreateLfgScreen.tsx';
import {AboutTwitarrScreen} from '../../Screens/Main/AboutTwitarrScreen.tsx';
import {FaqScreen} from '../../Screens/Main/FaqScreen.tsx';

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

export const MainStack = createNativeStackNavigator<MainStackParamList>();

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

export const useMainStack = () => useNavigation<NativeStackNavigationProp<MainStackParamList>>();
