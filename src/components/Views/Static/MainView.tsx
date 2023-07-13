import React, {useEffect} from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {commonStyles} from '../../../styles';
import {PaddedContentView} from '../Content/PaddedContentView';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDrawer} from '../../Context/Contexts/DrawerContext';

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
          <Text variant={'displayMedium'}>Hello Boat!</Text>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            ⚠️ Warning ⚠️
          </Text>
          <Text>This app is an extremely experimental prototype and should be treated as such.</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
