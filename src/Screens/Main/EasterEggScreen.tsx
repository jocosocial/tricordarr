import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import ArcadeButton from '#src/Components/Buttons/ArcadeButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useSoundEffect} from '#src/Hooks/useSoundEffect';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.easterEggScreen>;

export const EasterEggScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {playSound} = useSoundEffect('yeah.mp3');

  const getHeaderButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.easterEggHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderButtons,
    });
  }, [getHeaderButtons, navigation]);

  const styles = StyleSheet.create({
    container: {
      ...commonStyles.flex,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.justifyCenter,
    },
    text: {
      ...commonStyles.bold,
      ...commonStyles.onNoteContainer,
    },
  });

  return (
    <AppView>
      <View style={styles.container}>
        <ArcadeButton color={theme.colors.twitarrYellow} onPressIn={playSound}>
          <Text style={styles.text} variant={'displayMedium'}>
            YEAH
          </Text>
        </ArcadeButton>
      </View>
    </AppView>
  );
};
