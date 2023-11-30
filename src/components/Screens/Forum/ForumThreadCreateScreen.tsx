import React, {useRef} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {ForumCreateForm} from '../../Forms/ForumCreateForm';
import {FormikHelpers, FormikProps} from 'formik';
import {ForumCreateData} from '../../../libraries/Structs/ControllerStructs';
import {ForumThreadValues} from '../../../libraries/Types/FormValues';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumThreadCreateScreen,
  NavigatorIDs.forumStack
>;

export const ForumThreadCreateScreen = ({route, navigation}: Props) => {
  const forumFormRef = useRef<FormikProps<ForumThreadValues>>(null);

  const onSubmit = (values: ForumThreadValues, formikHelpers: FormikHelpers<ForumThreadValues>) => {
    console.log(values);
  };

  return (
    <AppView>
      <ScrollingContentView>
        <ForumCreateForm onSubmit={onSubmit} formRef={forumFormRef} />
      </ScrollingContentView>
    </AppView>
  );
};
