import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

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
        refreshControl={<AppRefreshControl refreshing={props.refreshing} onRefresh={props.onRefresh} />}>
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
