import {StackScreenProps} from '@react-navigation/stack';
import {AxiosError} from 'axios';
import React, {useCallback, useEffect} from 'react';
import {Text} from 'react-native-paper';

import {HuntHeaderButtons} from '#src/Components/Buttons/HeaderButtons/HuntHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {HuntListItem} from '#src/Components/Lists/Items/HuntListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HuntLoadErrorView} from '#src/Components/Views/Hunts/HuntLoadErrorView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {useHuntsQuery} from '#src/Queries/Hunts/HuntQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ErrorResponse} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.huntListScreen>;

/**
 * Catalog of puzzle hunts. Readable without login; call-in is gated on the puzzle screen.
 */
export const HuntListScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.huntHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.hunts} urlPath={'/hunts'}>
        <HuntListScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

/**
 * Hunt catalog list with pull-to-refresh.
 */
const HuntListScreenInner = ({navigation}: Props) => {
  const {data, isLoading, isError, error, refetch} = useHuntsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {commonStyles} = useStyles();

  const getNavButtons = useCallback(
    () => <HuntHeaderButtons onHelp={() => navigation.push(CommonStackComponents.huntHelpScreen)} />,
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

  if (isError && !data) {
    return (
      <HuntLoadErrorView
        resource={'hunts'}
        status={(error as AxiosError<ErrorResponse>)?.response?.status}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    );
  }

  if (!data) {
    return <LoadingView />;
  }

  const hunts = data.hunts;

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
