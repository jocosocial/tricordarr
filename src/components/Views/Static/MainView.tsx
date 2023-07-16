import React, {useEffect} from 'react';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {PaddedContentView} from '../Content/PaddedContentView';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {DailyThemeCard} from '../../Cards/MainScreen/DailyThemeCard';
import {HeaderCard} from '../../Cards/MainScreen/HeaderCard';
import {MainAnnouncementView} from '../MainAnnouncementView';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.mainScreen, NavigatorIDs.mainStack>;

export const MainView = ({navigation}: Props) => {
  const {getLeftMainHeaderButtons} = useDrawer();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: getLeftMainHeaderButtons,
    });
  }, [getLeftMainHeaderButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <HeaderCard />
          <DailyThemeCard />
          <MainAnnouncementView />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
