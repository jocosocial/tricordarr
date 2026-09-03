import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useHuntsQuery} from '#src/Queries/Admin/HuntQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminHuntsScreen>;

export const AdminHuntsScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminHuntsScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminHuntsScreenInner = ({navigation}: Props) => {
  const {data, refetch, isLoading} = useHuntsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useAdminHelpButton();

  if (isLoading && !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Puzzle Hunts</ListSubheader>
        </ListSection>
        {!data?.hunts.length && (
          <PaddedContentView padTop={true}>
            <Text>No hunts.</Text>
          </PaddedContentView>
        )}
        {data?.hunts.map(hunt => (
          <DataFieldListItem
            key={hunt.huntID}
            title={hunt.title}
            description={hunt.description}
            onPress={() => navigation.push(CommonStackComponents.adminHuntEditScreen, {huntID: hunt.huntID})}
          />
        ))}
      </ScrollingContentView>
      <BaseFAB
        testID={'huntCreate-fab'}
        label={'New Hunt'}
        onPress={() => navigation.push(CommonStackComponents.adminHuntEditScreen, {})}
      />
    </AppView>
  );
};
