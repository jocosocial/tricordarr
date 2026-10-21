import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PerformerTypeButtons} from '#src/Components/Buttons/SegmentedButtons/PerformerTypeButtons';
import {PerformerSearchBar} from '#src/Components/Search/PerformerSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {PerformerType} from '#src/Queries/Performer/PerformerQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {MaintenanceModeScreen} from '#src/Screens/Checkpoint/MaintenanceModeScreen';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.performerSearchScreen>;

export const PerformerSearchScreen = (props: Props) => {
  return (
    <MaintenanceModeScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.performers} urlPath={'/performers'}>
        <PerformerSearchScreenInner {...props} />
      </DisabledFeatureScreen>
    </MaintenanceModeScreen>
  );
};

const PerformerSearchScreenInner = ({navigation, route}: Props) => {
  const [performerType, setPerformerType] = useState<PerformerType>(route.params?.performerType || 'official');
  const {commonStyles} = useStyles();

  // Not PaddedContentView: it applies flex:1, which makes the buttons claim half the
  // screen and pushes the search bar down. Same reason as SeamailListScreen.
  const styles = useMemo(
    () =>
      StyleSheet.create({
        buttonContainer: {
          ...commonStyles.paddingSmall,
        },
      }),
    [commonStyles.paddingSmall],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.performerHelpScreen)}
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

  return (
    <AppView>
      <View style={styles.buttonContainer}>
        <PerformerTypeButtons performerType={performerType} setPerformerType={setPerformerType} />
      </View>
      <PerformerSearchBar performerType={performerType} />
    </AppView>
  );
};
