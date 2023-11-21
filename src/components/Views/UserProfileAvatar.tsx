import {AppImage} from '../Images/AppImage';
import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {useStyles} from '../Context/Contexts/StyleContext';
import {StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {useUserAvatarMutation, useUserImageDeleteMutation} from '../Queries/User/UserAvatarQueries';
import {useImageQuery} from '../Queries/ImageQuery';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useUserProfileQuery} from '../Queries/User/UserQueries';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';
import {useQueryClient} from '@tanstack/react-query';
import {ImageQueryData} from '../../libraries/Types';
import {AppImageViewer} from '../Images/AppImageViewer';

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
  const queryClient = useQueryClient();
  const fullImageQuery = useImageQuery(`/image/user/full/${user.header.userID}`, false);
  const [visible, setIsVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);
  const [enableFullQuery, setEnableFullQuery] = useState(false);

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
    } catch (err: any) {
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
    } catch (err: any) {
      setErrorMessage(err);
    }
  };

  const onSuccess = () => {
    avatarQuery.refetch().then(() => userProfileQuery.refetch());
    if (fullImageQuery.data) {
      queryClient.removeQueries([`/image/user/full/${user.header.userID}`]);
    }
  };

  const processImage = (image: Image) => {
    if (image.data) {
      avatarMutation.mutate(
        {
          image: image.data,
        },
        {
          onSuccess: onSuccess,
        },
      );
    }
  };

  const clearImage = () => {
    avatarDeleteMutation.mutate(
      {},
      {
        onSuccess: onSuccess,
      },
    );
  };

  const handleAvatarPress = () => {
    if (fullImageQuery.data) {
      setEnableFullQuery(true);
      return;
    }
    fullImageQuery.refetch().then(() => {
      setEnableFullQuery(true);
    });
  };

  useEffect(() => {
    if (enableFullQuery && fullImageQuery.data) {
      setViewerImages([fullImageQuery.data]);
      setIsVisible(true);
      setEnableFullQuery(false);
    }
  }, [enableFullQuery, fullImageQuery.data]);

  useEffect(() => {
    setRefreshing(
      avatarMutation.isLoading ||
        avatarQuery.isRefetching ||
        userProfileQuery.isRefetching ||
        fullImageQuery.isRefetching,
    );
  }, [
    avatarMutation.isLoading,
    avatarQuery.isRefetching,
    fullImageQuery.isRefetching,
    setRefreshing,
    userProfileQuery.isRefetching,
  ]);

  const isSelf = profilePublicData?.header.userID === user.header.userID;

  return (
    <View>
      <AppImageViewer viewerImages={viewerImages} isVisible={visible} setIsVisible={setIsVisible} />
      <AppImage
        style={styles.image}
        imageData={avatarQuery.data}
        isLoading={avatarQuery.isLoading || fullImageQuery.isLoading}
        onPress={handleAvatarPress}
      />
      {isSelf && (
        <View style={[commonStyles.flexRow, commonStyles.justifyCenter]}>
          <IconButton icon={AppIcons.newImage} onPress={pickImage} />
          <IconButton icon={AppIcons.newImageCamera} onPress={takeImage} />
          {profilePublicData?.header.userImage && <IconButton icon={AppIcons.delete} onPress={clearImage} />}
        </View>
      )}
    </View>
  );
};
