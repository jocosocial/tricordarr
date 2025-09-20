import {NativeStackScreenProps} from '@react-navigation/native-stack';
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

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.dailyThemeScreen>;

export const DailyThemeScreen = ({route}: Props) => {
  const {refetch} = useDailyThemeQuery();
  const {commonStyles} = useStyles();
  const [refreshing, setRefreshing] = useState(false);
  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontalSmall,
    },
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
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <DataFieldListItem itemStyle={styles.item} description={route.params.dailyTheme.title} title={'Title'} />
          <DataFieldListItem itemStyle={styles.item} description={route.params.dailyTheme.info} title={'Info'} />
          {route.params.dailyTheme.image && (
            <View style={styles.imageView}>
              <APIImage
                fullPath={`/image/full/${route.params.dailyTheme.image}`}
                thumbPath={`/image/thumb/${route.params.dailyTheme.image}`}
              />
            </View>
          )}
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
