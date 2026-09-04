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
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminDailyThemesScreen>;

export const AdminDailyThemesScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'tho'}>
      <AdminDailyThemesScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminDailyThemesScreenInner = ({navigation}: Props) => {
  const {data, refetch, isLoading} = useDailyThemeQuery();
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
          <ListSubheader>Daily Themes</ListSubheader>
        </ListSection>
        {!data?.length && (
          <PaddedContentView padTop={true}>
            <Text>No daily themes.</Text>
          </PaddedContentView>
        )}
        {data?.map(theme => (
          <DataFieldListItem
            key={theme.themeID}
            title={`Day ${theme.cruiseDay}: ${theme.title}`}
            description={theme.info}
            onPress={() => navigation.push(CommonStackComponents.adminDailyThemeEditScreen, {dailyTheme: theme})}
          />
        ))}
      </ScrollingContentView>
      <BaseFAB
        testID={'themeCreate-fab'}
        label={'New Theme'}
        onPress={() => navigation.push(CommonStackComponents.adminDailyThemeEditScreen, {})}
      />
    </AppView>
  );
};
