import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {APIImage} from '#src/Components/Images/APIImage';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.dailyThemeScreen>;

export const DailyThemeScreen = ({route, navigation}: Props) => {
  const {refetch} = useDailyThemeQuery();
  const {commonStyles} = useStyles();
  const [refreshing, setRefreshing] = useState(false);
  const styles = StyleSheet.create({
    imageView: {
      ...commonStyles.marginHorizontal,
      ...commonStyles.marginVerticalSmall,
    },
  });

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.dailyThemeHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <DataFieldListItem description={route.params.dailyTheme.title} title={'Title'} />
          <DataFieldListItem description={route.params.dailyTheme.info} title={'Info'} />
          {route.params.dailyTheme.image && (
            <View style={styles.imageView}>
              <APIImage path={route.params.dailyTheme.image} />
            </View>
          )}
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
