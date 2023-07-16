import React, {useEffect} from 'react';
import {Card, Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {PaddedContentView} from '../Content/PaddedContentView';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import MainViewDayImage from '../../../../assets/mainview_day.jpg';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {AndroidColor} from '@notifee/react-native';
import {useDailyThemeQuery} from '../../Queries/Alert/DailyThemeQueries';
import {DailyThemeCard} from '../../Cards/MainScreen/DailyThemeCard';
import {HeaderCard} from '../../Cards/MainScreen/HeaderCard';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.mainScreen, NavigatorIDs.mainStack>;

export const MainView = ({navigation}: Props) => {
  const {getLeftMainHeaderButtons} = useDrawer();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();
  const theme = useAppTheme();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: getLeftMainHeaderButtons,
    });
  }, [getLeftMainHeaderButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          {/*<Text variant={'displayMedium'}>Hello Boat!</Text>*/}
          {/*<Text variant={'titleLarge'} style={commonStyles.marginTop}>*/}
          {/*  ⚠️ Warning ⚠️*/}
          {/*</Text>*/}
          {/*<Text>This app is an extremely experimental prototype and should be treated as such.</Text>*/}
          <HeaderCard />
          <DailyThemeCard />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
