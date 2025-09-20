import React from 'react';
import {RefreshControl, View} from 'react-native';
import {Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../Libraries/Enums/Icons';

interface ErrorViewProps {
  refreshing: boolean;
  onRefresh: () => void;
}
export const ErrorView = (props: ErrorViewProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    outerContainer: [commonStyles.flex, commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    innerContainer: [commonStyles.justifyCenter, commonStyles.alignItemsCenter],
    contentContainer: [commonStyles.marginVerticalSmall],
  };
  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={props.refreshing} onRefresh={props.onRefresh} />}>
        <View style={styles.outerContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.contentContainer}>
              <AppIcon icon={AppIcons.error} size={150} />
            </View>
            <View style={styles.contentContainer}>
              <Text>Something went wrong</Text>
            </View>
          </View>
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
