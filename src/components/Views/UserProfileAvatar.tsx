import {AppImage} from '../Images/AppImage';
import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {useStyles} from '../Context/Contexts/StyleContext';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {useUserAvatarMutation, useUserImageDeleteMutation} from '../Queries/User/UserAvatarQueries';
import {useImageQuery} from '../Queries/ImageQuery';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useUserProfileQuery} from '../Queries/User/UserQueries';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';

interface UserProfileAvatarProps {
  user: ProfilePublicData;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

export const UserProfileAvatar = ({user, setRefreshing}: UserProfileAvatarProps) => {
  const {commonStyles} = useStyles();
  const avatarDeleteMutation = useUserImageDeleteMutation();
  const avatarQuery = useImageQuery(`/image/user/thumb/${user.header.userID}`);
  const avatarMutation = useUserAvatarMutation();
  const {setErrorMessage} = useErrorHandler();
  const userProfileQuery = useUserProfileQuery();
  const {profilePublicData} = useUserData();

  const styles = StyleSheet.create({
    image: {
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.headerImage,
    },
  });

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        width: 2048,
        height: 2048,
        includeBase64: true,
        mediaType: 'photo',
      });
      processImage(image);
    } catch (err) {
      setErrorMessage(err);
    }
  };

  const takeImage = async () => {
    const permissionStatus = await requestPermission(PERMISSIONS.ANDROID.CAMERA);
    console.log(permissionStatus);
    try {
      const image = await ImagePicker.openCamera({
        cropping: true,
        width: 2048,
        height: 2048,
        includeBase64: true,
        mediaType: 'photo',
      });
      processImage(image);
    } catch (err) {
      setErrorMessage(err);
    }
  };

  const processImage = (image: Image) => {
    if (image.data) {
      avatarMutation.mutate(
        {
          image: image.data,
        },
        {
          onSuccess: () => {
            avatarQuery.refetch();
            userProfileQuery.refetch();
          },
        },
      );
    }
  };

  const clearImage = () => {
    console.log('clear');
    avatarDeleteMutation.mutate(
      {},
      {
        onSuccess: () => {
          avatarQuery.refetch();
          userProfileQuery.refetch();
        },
      },
    );
  };

  const onTouch = () => {
    avatarQuery.refetch();
  };

  useEffect(() => {
    setRefreshing(avatarMutation.isLoading || avatarQuery.isRefetching || userProfileQuery.isRefetching);
  }, [avatarMutation.isLoading, avatarQuery.isRefetching, setRefreshing, userProfileQuery.isRefetching]);

  return (
    <View>
      <TouchableOpacity onPress={onTouch}>
        <AppImage style={styles.image} path={`/image/user/thumb/${user.header.userID}`} />
      </TouchableOpacity>
      <View style={[commonStyles.flexRow, commonStyles.justifyCenter]}>
        <IconButton icon={AppIcons.newImage} onPress={pickImage} />
        <IconButton icon={AppIcons.newImageCamera} onPress={takeImage} />
        {profilePublicData?.header.userImage && <IconButton icon={AppIcons.delete} onPress={clearImage} />}
      </View>
    </View>
  );
};
