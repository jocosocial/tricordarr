import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {QuartermasterForm} from '#src/Components/Forms/Quartermaster/QuartermasterForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useQuartermasterCacheReducer} from '#src/Hooks/Quartermaster/useQuartermasterCacheReducer';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {createLogger} from '#src/Libraries/Logger';
import {
  getEmptyQuartermasterFormValues,
  toQuartermasterCreateData,
} from '#src/Libraries/Quartermaster/QuartermasterForm';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {useQuartermasterCreateMutation} from '#src/Queries/Quartermaster/QuartermasterMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {QuartermasterFormValues} from '#src/Types/FormValues';

const logger = createLogger('QuartermasterCreateScreen.tsx');

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.quartermasterCreateScreen>;

/**
 * Create screen for a Quartermastarr item, wrapped in the standard checkpoints.
 */
export const QuartermasterCreateScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.quartermasterHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.quartermaster} urlPath={'/quartermaster/create'}>
          <QuartermasterCreateScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Create form with Save and Save & Add Another. Both create exactly one item per request.
 */
const QuartermasterCreateScreenInner = ({navigation, route}: Props) => {
  const createMutation = useQuartermasterCreateMutation();
  const {createItems} = useQuartermasterCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const {setSnackbarPayload} = useSnackbar();
  const initialValues = getEmptyQuartermasterFormValues(route.params?.category);

  /**
   * Creates the item and patches the list caches from the response. Resolves `true` on success;
   * a failure has already raised the error snackbar via useTokenAuthMutation, so it is only
   * logged here and swallowed rather than escaping into Formik's submit handling.
   */
  const create = useCallback(
    async (values: QuartermasterFormValues): Promise<boolean> => {
      try {
        const response = await createMutation.mutateAsync({createData: toQuartermasterCreateData(values)});
        createItems(response.data);
        return true;
      } catch (error) {
        logger.error('Quartermastarr create failed.', error);
        return false;
      }
    },
    [createMutation, createItems],
  );

  /**
   * Save: create the item, then return to the list scrolled to the top.
   */
  const onSave = async (values: QuartermasterFormValues) => {
    if (await create(values)) {
      dispatchScrollToTop(MainStackComponents.quartermasterListScreen);
      navigation.goBack();
    }
  };

  /**
   * Save & Add Another: create the item, then clear the per-item fields and keep the shared
   * ones (category, location, anonymity) for the next entry.
   */
  const onSaveAndAddAnother = async (
    values: QuartermasterFormValues,
    helpers: FormikHelpers<QuartermasterFormValues>,
  ) => {
    if (await create(values)) {
      setSnackbarPayload({message: `Added "${values.itemName.trim()}".`, messageType: 'info'});
      helpers.resetForm({values: {...values, itemName: '', itemDescription: '', image: {}}});
    }
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.quartermasterHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({headerRight: getNavButtons});
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <QuartermasterForm
            initialValues={initialValues}
            onSubmit={onSave}
            onSubmitAndAddAnother={onSaveAndAddAnother}
            buttonText={'Save'}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
