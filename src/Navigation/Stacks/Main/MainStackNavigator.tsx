import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens} from '#src/Navigation/Stacks/Common/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {SettingsStackNavigator} from '#src/Navigation/Stacks/Settings/SettingsStackNavigator';
import {BoardgameCreateLfgScreen} from '#src/Screens/Boardgames/BoardgameCreateLfgScreen';
import {BoardgameExpansionsScreen} from '#src/Screens/Boardgames/BoardgameExpansionsScreen';
import {BoardgameListScreen} from '#src/Screens/Boardgames/BoardgameListScreen';
import {BoardgameRecommendScreen} from '#src/Screens/Boardgames/BoardgameRecommendScreen';
import {BoardgameScreen} from '#src/Screens/Boardgames/BoardgameScreen';
import {BoardgameSearchScreen} from '#src/Screens/Boardgames/BoardgameSearchScreen';
import {KaraokeFavoritesListScreen} from '#src/Screens/Karaoke/KaraokeFavoritesListScreen';
import {KaraokeLogPerformanceScreen} from '#src/Screens/Karaoke/KaraokeLogPerformanceScreen';
import {KaraokePerformanceListScreen} from '#src/Screens/Karaoke/KaraokePerformanceListScreen';
import {KaraokeSearchScreen} from '#src/Screens/Karaoke/KaraokeSearchScreen';
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

export const MainStack = createStackNavigator<MainStackParamList>();

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
      <MainStack.Screen
        name={MainStackComponents.karaokePerformanceListScreen}
        component={KaraokePerformanceListScreen}
        options={{title: 'Karaoke'}}
      />
      <MainStack.Screen
        name={MainStackComponents.karaokeSearchScreen}
        component={KaraokeSearchScreen}
        options={{title: 'Search Library'}}
      />
      <MainStack.Screen
        name={MainStackComponents.karaokeFavoritesListScreen}
        component={KaraokeFavoritesListScreen}
        options={{title: 'Favorites'}}
      />
      <MainStack.Screen
        name={MainStackComponents.karaokeLogPerformanceScreen}
        component={KaraokeLogPerformanceScreen}
        options={{title: 'Log Performance'}}
      />
      {CommonScreens(MainStack)}
    </MainStack.Navigator>
  );
};
