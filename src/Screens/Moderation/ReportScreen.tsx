import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ReportContentForm} from '#src/Components/Forms/ReportContentForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useReportMutation} from '#src/Queries/Moderation/ModerationMutations';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ReportData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.reportScreen>;

export const ReportScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.reportHelpScreen}>
        <ReportScreenInner {...props} />
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const ReportScreenInner = ({route, navigation}: Props) => {
  const reportMutation = useReportMutation();
  const {setSnackbarPayload} = useSnackbar();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.reportHelpScreen)}
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

  const onSubmit = (values: ReportData, formikHelpers: FormikHelpers<ReportData>) => {
    reportMutation.mutate(
      {
        contentType: route.params.contentType,
        contentID: route.params.contentID,
        reportData: values,
      },
      {
        onSuccess: () => {
          formikHelpers.resetForm();
          setSnackbarPayload({message: 'Report submitted successfully!', messageType: 'success'});
          navigation.goBack();
        },
        onSettled: () => {
          formikHelpers.setSubmitting(false);
        },
      },
    );
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text>
            Use this form to report content or users to the Twitarr Moderation Team. We'll review it within 24 hours,
            and if deemed inappropriate the content will be removed and we may take actions against its author.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>The content you are reporting is already attached. You can add additional information below.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <ReportContentForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
