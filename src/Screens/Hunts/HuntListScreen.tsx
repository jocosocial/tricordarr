import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {HuntListItem} from '#src/Components/Lists/Items/HuntListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {useHuntsQuery} from '#src/Queries/Hunts/HuntQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.huntListScreen>;

/**
 * Catalog of puzzle hunts. Requires login so call-in progress is available on later screens.
 */
export const HuntListScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.huntHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.hunts} urlPath={'/hunts'}>
          <HuntListScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Logged-in hunt catalog list with pull-to-refresh.
 */
const HuntListScreenInner = ({navigation}: Props) => {
  const {data, isLoading, refetch} = useHuntsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {commonStyles} = useStyles();

  const getNavButtons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.huntHelpScreen)}
            testID={'headerHelp-headerButton'}
          />
        </MaterialHeaderButtons>
      </View>
    ),
    [navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading) {
    return <LoadingView />;
  }

  const hunts = data?.hunts ?? [];

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {hunts.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text style={commonStyles.onBackground}>No puzzle hunts have been created.</Text>
          </PaddedContentView>
        ) : (
          <ListSection>
            {hunts.map(hunt => (
              <HuntListItem key={hunt.huntID} hunt={hunt} />
            ))}
          </ListSection>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
