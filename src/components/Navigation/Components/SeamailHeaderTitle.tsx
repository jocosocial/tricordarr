import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NavHeaderTitle} from '../../Text/NavHeaderTitle';
import React from 'react';
import {SeamailStackParamList} from '../Stacks/SeamailStackNavigator';
import {CommonStackComponents} from '../CommonScreens';

interface SeamailHeaderTitleProps {
  fezID: string;
}

const SeamailHeaderTitle = ({fezID}: SeamailHeaderTitleProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<SeamailStackParamList>>();
  const onPress = () =>
    navigation.push(CommonStackComponents.seamailDetailsScreen, {
      fezID: fezID,
    });
  return <NavHeaderTitle title={'Seamail Chat'} onPress={onPress} />;
};

// This exists to prevent defining the component during render, because the navigator
// requires a () => Element not an Element. Because.... reasons?
export const getSeamailHeaderTitle = (fezID: string) => () => <SeamailHeaderTitle fezID={fezID} />;
