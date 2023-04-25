import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {NavHeaderTitle} from '../../Text/NavHeaderTitle';
import React from 'react';
import {SeamailStackParamList} from '../Stacks/SeamailStack';

interface SeamailHeaderTitleProps {
  fezID: string;
  title: string;
}

export const SeamailHeaderTitle = ({fezID, title}: SeamailHeaderTitleProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<SeamailStackParamList>>();
  const onPress = () =>
    navigation.push(SeamailStackScreenComponents.seamailDetailsScreen, {
      fezID: fezID,
    });
  return <NavHeaderTitle title={title} onPress={onPress} />;
};
