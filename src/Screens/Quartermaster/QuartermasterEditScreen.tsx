import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import {QuartermasterForm} from '#src/Components/Forms/Quartermaster/QuartermasterForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useQuartermasterCacheReducer} from '#src/Hooks/Quartermaster/useQuartermasterCacheReducer';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {createLogger} from '#src/Libraries/Logger';
import {toQuartermasterContentData, toQuartermasterFormValues} from '#src/Libraries/Quartermaster/QuartermasterForm';
import {invalidateQueryKeys} from '#src/Libraries/QueryInvalidation';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {getQuartermasterModerationEndpoint} from '#src/Queries/Quartermaster/QuartermasterCacheKeys';
import {useQuartermasterUpdateMutation} from '#src/Queries/Quartermaster/QuartermasterMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {QuartermasterFormValues} from '#src/Types/FormValues';

const logger = createLogger('QuartermasterEditScreen.tsx');

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.quartermasterEditScreen>;

/**
 * Edit screen for a Quartermastarr item, wrapped in the standard checkpoints.
 */
export const QuartermasterEditScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.quartermasterHelpScreen}>
        <DisabledFeatureScreen
          feature={SwiftarrFeature.quartermaster}
          urlPath={`/quartermaster/${props.route.params.item.itemID}/edit`}>
          <QuartermasterEditScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Edit form for an existing item. The photo is kept unless it is cleared or replaced.
 */
const QuartermasterEditScreenInner = ({navigation, route}: Props) => {
  const {item} = route.params;
  const updateMutation = useQuartermasterUpdateMutation();
  const {updateItem} = useQuartermasterCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const queryClient = useQueryClient();

  /**
   * Saves the edit and patches the caches from the response. An edit bumps the item to the top
   * of its list, so the list is told to scroll up when the user returns to it.
   */
  const onSubmit = async (values: QuartermasterFormValues) => {
    try {
      const response = await updateMutation.mutateAsync({
        itemID: item.itemID,
        contentData: toQuartermasterContentData(values),
      });
      updateItem(response.data);
      // A moderator edits from the moderate screen, whose payload (content, edit history) can't be
      // patched locally. It stays mounted under this screen, so refetch it. A no-op when nothing
      // has loaded that query.
      invalidateQueryKeys(queryClient, [[getQuartermasterModerationEndpoint(item.itemID)]]);
      dispatchScrollToTop(MainStackComponents.quartermasterListScreen);
      navigation.goBack();
    } catch (error) {
      // The error snackbar is raised by useTokenAuthMutation. Swallow so the rejection doesn't
      // escape into Formik's submit handling.
      logger.error('Quartermastarr update failed.', error);
    }
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <QuartermasterForm initialValues={toQuartermasterFormValues(item)} onSubmit={onSubmit} buttonText={'Save'} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
