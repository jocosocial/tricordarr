import React, {useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {ListSection} from '../../Lists/ListSection';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useDailyThemeQuery} from '../../Queries/Alert/DailyThemeQueries';
import {APIImage} from '../../Images/APIImage';

export type Props = NativeStackScreenProps<
  MainStackParamList,
  MainStackComponents.dailyThemeScreen,
  NavigatorIDs.mainStack
>;

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
