import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers, FormikProps} from 'formik';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {SeamailCreateForm} from '#src/Components/Forms/SeamailCreateForm';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PostAsUserWarningView} from '#src/Components/Views/Warnings/PostAsUserWarningView';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ElevationProvider} from '#src/Context/Providers/ElevationProvider';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useKeyboardVerticalOffset} from '#src/Hooks/Keyboard/useKeyboardVerticalOffset';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {createLogger} from '#src/Libraries/Logger';
import {ChatStackScreenComponents} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezCreateMutation} from '#src/Queries/Fez/FezMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezContentData, PostContentData} from '#src/Structs/ControllerStructs';
import {SeamailFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.seamailCreateScreen>;

const logger = createLogger('SeamailCreateScreen.tsx');

export const SeamailCreateScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.seamailCreateHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.seamail} urlPath={'/seamail/create'}>
        <ElevationProvider initialElevation={props.route.params?.asPrivilegedUser}>
          <SeamailCreateScreenInner {...props} />
        </ElevationProvider>
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

// Chips: https://github.com/callstack/react-native-paper/issues/801
const SeamailCreateScreenInner = ({navigation, route}: Props) => {
  const seamailCreateFormRef = useRef<FormikProps<SeamailFormValues>>(null);
  const seamailPostFormRef = useRef<FormikProps<PostContentData>>(null);
  const fezMutation = useFezCreateMutation();
  const [seamailFormValid, setSeamailFormValid] = useState(false);
  const {createFez} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const {asPrivilegedUser} = useElevation();
  const {commonStyles} = useStyles();
  const keyboardVerticalOffset = useKeyboardVerticalOffset();

  const initialFormValues: SeamailFormValues = {
    fezType: FezType.open,
    info: '',
    initialUsers: route.params?.initialUserHeaders || [],
    maxCapacity: 0,
    minCapacity: 0,
    title: '',
    createdByTwitarrTeam: asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam,
    createdByModerator: asPrivilegedUser === PrivilegedUserAccounts.moderator,
  };

  /**
   * Creates the seamail and its opening message in a single request. Swiftarr's
   * FezContentData.firstPost builds both server-side, so a lossy connection can no longer
   * leave behind an empty conversation the way the old create-then-post pair could (#533).
   */
  const onFezSubmit = useCallback(
    async (values: SeamailFormValues) => {
      const postValues = seamailPostFormRef.current?.values;
      if (!postValues) {
        logger.error('Post form ref undefined.');
        return;
      }
      const contentData: FezContentData = {
        ...values,
        initialUsers: values.initialUsers.map(u => u.userID),
        firstPost: {
          ...postValues,
          // Whatever we picked in the SeamailCreate is what should be set in the Post.
          postAsModerator: values.createdByModerator,
          postAsTwitarrTeam: values.createdByTwitarrTeam,
        },
      };
      try {
        const response = await fezMutation.mutateAsync({fezContentData: contentData});
        const forUser = values.createdByTwitarrTeam
          ? 'TwitarrTeam'
          : values.createdByModerator
            ? 'moderator'
            : undefined;
        // The create response already carries the opening post in members.posts, so priming
        // the detail cache here is enough -- no appendPost, which would double the counts.
        createFez(response.data, forUser);
        dispatchScrollToTop(ChatStackScreenComponents.seamailListScreen);
        navigation.replace(CommonStackComponents.seamailChatScreen, {
          fezID: response.data.fezID,
          asPrivilegedUser,
        });
      } catch {
        // useTokenAuthMutation raises the error snackbar at the hook level. Swallow the
        // rejection so it doesn't escape into Formik's submit handling.
      }
    },
    [fezMutation, createFez, dispatchScrollToTop, navigation, asPrivilegedUser],
  );

  /**
   * The composer's own Formik never submits: its button triggers the seamail form instead,
   * which owns the single create request. This only releases the submitting flag.
   */
  const onPostSubmit = useCallback(async (_values: PostContentData, formikBag: FormikHelpers<PostContentData>) => {
    formikBag.setSubmitting(false);
  }, []);

  // Handler to trigger the chain of events needed to complete this screen.
  const onSubmit = useCallback(() => {
    seamailCreateFormRef.current?.submitForm();
  }, []);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.seamailCreateHelpScreen)}
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
      <PostAsUserWarningView />
      <KeyboardAvoidingView
        style={commonStyles.flex}
        behavior={'padding'}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollingContentView>
          <SeamailCreateForm
            formRef={seamailCreateFormRef}
            onSubmit={onFezSubmit}
            initialValues={initialFormValues}
            onValidationChange={setSeamailFormValid}
            showPostAsOptions={false}
          />
        </ScrollingContentView>
        <ContentPostForm
          formRef={seamailPostFormRef}
          overrideSubmitting={fezMutation.isPending}
          onPress={onSubmit}
          onSubmit={onPostSubmit}
          enablePhotos={false}
          disabled={!seamailFormValid}
        />
      </KeyboardAvoidingView>
    </AppView>
  );
};
