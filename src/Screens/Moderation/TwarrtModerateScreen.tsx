import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModerationContentPreview} from '#src/Components/Views/Moderation/ModerationContentPreview';
import {ModerationDeletedNotice} from '#src/Components/Views/Moderation/ModerationDeletedNotice';
import {ModerationPostEditList} from '#src/Components/Views/Moderation/ModerationPostEditList';
import {ModerationReportsSection} from '#src/Components/Views/Moderation/ModerationReportsSection';
import {ModerationStateActions} from '#src/Components/Views/Moderation/ModerationStateActions';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useModerationContentActions} from '#src/Hooks/useModerationContentActions';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useTwarrtModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {TwarrtModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.twarrtModerateScreen>;

const TwarrtModerateScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {data, refetch, isLoading} = useTwarrtModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(TwarrtModerationData.getCacheKeys(id));
  useModerationHelpHeader();

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationDeletedNotice contentLabel={'twarrt'} visible={data.isDeleted} />
        <PaddedContentView padTop={true}>
          <ModerationContentPreview
            author={data.twarrt.author}
            timestamp={data.twarrt.createdAt}
            text={data.twarrt.text}
            images={data.twarrt.images}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Twarrts have no in-app feed. Set state and review reports here; there is no View in Context screen.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <ModerationActionRow
            buttons={[
              {
                label: 'Mod User',
                onPress: () => pushModerateResource(navigation, 'user', data.twarrt.author.userID),
              },
            ]}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ModerationStateActions
            status={data.moderationStatus}
            disabled={data.isDeleted}
            isLoading={actions.isLoading}
            onSelect={state => actions.setState('twarrt', id, state)}
          />
        </PaddedContentView>
        <ModerationPostEditList edits={data.edits} />
        <ModerationReportsSection
          reports={data.reports}
          contentLabel={'twarrt'}
          isLoading={actions.isLoading}
          onHandleAll={() => actions.handleAll(data.reports)}
          onCloseAll={() => actions.closeAll(data.reports)}
        />
      </ScrollingContentView>
    </AppView>
  );
};

export const TwarrtModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <TwarrtModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
