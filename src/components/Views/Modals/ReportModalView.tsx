import React from 'react';
import {View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import {useModal} from '../../Context/Contexts/ModalContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {FezPostData, ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {SaveButton} from '../../Buttons/SaveButton';
import {useAppTheme} from '../../../styles/Theme';
import {TextField} from '../../Forms/Fields/TextField';
import {ReportContentForm} from '../../Forms/ReportContentForm';

interface ReportModalViewProps {
  content: ProfilePublicData | FezPostData;
}

export const ReportModalView = ({content}: ReportModalViewProps) => {
  const onSubmit = (values) => console.log('Submit report', values);

  return <ReportContentForm onSubmit={onSubmit} />;
};
