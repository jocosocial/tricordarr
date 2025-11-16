import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {RefreshControl, StyleSheet, View} from 'react-native';

import {APIImage} from '#src/Components/Images/APIImage';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.dailyThemeScreen>;

export const DailyThemeScreen = ({route}: Props) => {
  const {refetch} = useDailyThemeQuery();
  const {commonStyles} = useStyles();
  const [refreshing, setRefreshing] = useState(false);
  const styles = StyleSheet.create({
    imageView: {
      ...commonStyles.marginHorizontal,
      ...commonStyles.marginVerticalSmall,
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
