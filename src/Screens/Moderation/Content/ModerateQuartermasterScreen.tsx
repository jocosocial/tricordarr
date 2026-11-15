import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {APIImage} from '#src/Components/Images/APIImage';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ModerationEditListItem} from '#src/Components/Lists/Items/Moderation/ModerationEditListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentAuthorSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentAuthorSectionView';
import {ModerationContentHistorySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentHistorySectionView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationContentSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentSectionView';
import {ModerationContentVisibilitySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentVisibilitySectionView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {AppIcons} from '#src/Enums/Icons';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useQuartermasterDelete} from '#src/Hooks/Quartermaster/useQuartermasterDelete';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useQuartermasterModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {getQuartermasterCacheKeys} from '#src/Queries/Quartermaster/QuartermasterCacheKeys';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {QuartermasterEditLogData, ReportModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateQuartermasterScreen>;

/**
 * Moderator view of an item: unmasked content and owner, state, edit history, and reports.
 */
const ModerateQuartermasterScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {data, refetch, isLoading} = useQuartermasterModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(
    getQuartermasterCacheKeys({itemID: id}).concat(ReportModerationData.getCacheKeys()),
  );
  const {deleteNow, isPending: isDeleting} = useQuartermasterDelete();
  const getNavButtons = useModerationHeaderButtons({
    moderateType: ShareContentType.quartermasterModerate,
    moderateID: id,
    contentType: ShareContentType.quartermaster,
    contentID: id,
    contentIcon: AppIcons.quartermaster,
  });

  useEffect(() => {
    navigation.setOptions({headerRight: getNavButtons});
  }, [getNavButtons, navigation]);

  /**
   * Renders one previous state of the item. The log stores the state *before* each edit, so the
   * author of a state is whoever made the previous edit -- or the owner for the first one.
   */
  const renderEdit = useCallback(
    (edit: QuartermasterEditLogData) => {
      if (!data) {
        return null;
      }
      const index = data.edits.findIndex(e => e.editID === edit.editID);
      const author = index <= 0 ? data.item.owner : data.edits[index - 1].author;
      if (!author) {
        return null;
      }
      return (
        <ModerationEditListItem
          author={author}
          timestamp={edit.createdAt}
          text={[
            edit.itemName,
            edit.itemDescription,
            edit.location && `Location: ${edit.location}`,
            edit.hideOwnerName ? 'Name hidden' : undefined,
          ]
            .filter(Boolean)
            .join('\n')}
          images={edit.image ? [edit.image] : undefined}
          bylinePrefix={index <= 0 ? 'Initially by' : 'Edited by'}
        />
      );
    },
    [data],
  );

  if (isLoading || !data) {
    return (
      <AppView>
        <LoadingView refreshing={refreshing} onRefresh={onRefresh} />
      </AppView>
    );
  }

  const item = data.item;

  const onDelete = () => {
    alertDeleteModeratedContent('Quartermastarr item', () => {
      // The mod payload has to refetch for isDeleted to flip, along with the reports and action log.
      deleteNow(id, {onSuccess: () => actions.invalidate()});
    });
  };

  const onEdit = () => {
    navigation.push(CommonStackComponents.quartermasterEditScreen, {item});
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'Quartermastarr item'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationContentSectionView
          testIDPrefix={'quartermasterModerate'}
          disabled={data.isDeleted}
          onViewInContext={() => navigation.push(CommonStackComponents.quartermasterItemScreen, {itemID: id})}>
          <DataFieldListItem title={'Item'} description={item.itemName} />
          <DataFieldListItem title={'Category'} description={QuartermasterCategory.getLabel(item.category)} />
          {item.itemDescription ? <DataFieldListItem title={'Description'} description={item.itemDescription} /> : null}
          <DataFieldListItem title={'Location'} description={item.location || 'Not specified'} />
          <DataFieldListItem
            title={'Owner'}
            description={
              item.owner ? `@${item.owner.username}${item.hideOwnerName ? ' (name hidden from users)' : ''}` : 'Unknown'
            }
          />
          {item.image ? <APIImage path={item.image} mode={'scaledimage'} /> : null}
        </ModerationContentSectionView>
        <ModerationContentVisibilitySectionView
          data={data}
          testIDPrefix={'quartermasterModerate'}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
        <ModerationContentHistorySectionView edits={data.edits} renderEdit={renderEdit} />
        <ModerationContentReportsSectionView reports={data.reports} />
        <ModerationContentAuthorSectionView moderateUserID={item.owner?.userID} />
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        testIDPrefix={'quartermasterModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

/**
 * Moderator-only screen for one Quartermastarr item.
 */
export const ModerateQuartermasterScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateQuartermasterScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
