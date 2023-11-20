import {AppImage} from '../Images/AppImage';
import React from 'react';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {useStyles} from '../Context/Contexts/StyleContext';
import {StyleSheet, Touchable, TouchableOpacity, View} from 'react-native';
import {Button, TouchableRipple} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import {useUserAvatarMutation, useUserImageDeleteMutation} from '../Queries/User/UserAvatarQueries';
import {useNavigation} from '@react-navigation/native';
import {useImageQuery} from '../Queries/ImageQuery';

export const UserProfileAvatar = ({user}: {user: ProfilePublicData}) => {
  const {commonStyles} = useStyles();
  const avatarDeleteMutation = useUserImageDeleteMutation();
  const avatarQuery = useImageQuery(`/image/user/thumb/${user.header.userID}`);
  const avatarMutation = useUserAvatarMutation();
  // const {data: avatarImage} = useImageQuery(`/image/user/thumb/${user.header.userID}`);

  const styles = StyleSheet.create({
    image: {
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.headerImage,
    },
  });

  const pickImage = async () => {
    console.log('image pick');
    const image = await ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: true,
      mediaType: 'photo',
    });
    console.log(image.path);
    if (image.data) {
      avatarMutation.mutate(
        {
          image: image.data,
        },
        {
          onSuccess: () => {
            avatarQuery.refetch();
          },
        },
      );
    }
    // const imageData = await fetch(image.path);
    // const blob = await imageData.blob();
    // const arrayBuffer = await new Response(blob).arrayBuffer();
  };

  const clearImage = () => {
    console.log('clear');
    avatarDeleteMutation.mutate(
      {},
      {
        onSuccess: () => {
          avatarQuery.refetch();
        },
      },
    );
  };

  const onTouch = () => {
    console.log('Refreshing');
    avatarQuery.refetch();
  };

  return (
    <View>
      <TouchableOpacity onPress={onTouch}>
        <AppImage style={styles.image} path={`/image/user/thumb/${user.header.userID}`} />
      </TouchableOpacity>
      <Button onPress={pickImage}>Pick</Button>
      <Button onPress={clearImage}>Clear</Button>
    </View>
  );
};
