import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {useStyles} from '../Context/Contexts/StyleContext';
import {StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {useUserAvatarMutation, useUserImageDeleteMutation} from '../Queries/User/UserAvatarQueries';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';
import {APIImage} from '../Images/APIImage';
import {useFeature} from '../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../libraries/Enums/AppFeatures';
import {useUserProfileQuery} from '../Queries/Users/UserProfileQueries';

interface UserProfileAvatarProps {
  user: ProfilePublicData;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

export const UserProfileAvatar = ({user, setRefreshing}: UserProfileAvatarProps) => {
  const {commonStyles} = useStyles();
  const avatarDeleteMutation = useUserImageDeleteMutation();
  const avatarMutation = useUserAvatarMutation();
  const {setErrorMessage} = useErrorHandler();
  const userProfileQuery = useUserProfileQuery(user.header.userID);
  const {profilePublicData} = useUserData();
  const {getIsDisabled} = useFeature();

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
    console.log('[UserProfileAvatar.tsx] Camera permission is', permissionStatus);
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
    userProfileQuery.refetch();
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

  useEffect(() => {
    setRefreshing(avatarMutation.isLoading || userProfileQuery.isRefetching);
  }, [avatarMutation.isLoading, setRefreshing, userProfileQuery.isRefetching]);

  const isSelf = profilePublicData?.header.userID === user.header.userID;

  if (!userProfileQuery.data) {
    return <></>;
  }

  let thumbPath = `/image/thumb/${user.header.userImage}`;
  let fullPath = `/image/full/${user.header.userImage}`;
  if (!user.header.userImage) {
    thumbPath = `/image/user/identicon/${user.header.userID}`;
    fullPath = `/image/user/identicon/${user.header.userID}`;
  }

  return (
    <View>
      <APIImage thumbPath={thumbPath} fullPath={fullPath} mode={'image'} style={styles.image} />
      {isSelf && !getIsDisabled(SwiftarrFeature.images) && (
        <View style={[commonStyles.flexRow, commonStyles.justifyCenter]}>
          <IconButton icon={AppIcons.newImage} onPress={pickImage} />
          <IconButton icon={AppIcons.newImageCamera} onPress={takeImage} />
          <IconButton icon={AppIcons.delete} onPress={clearImage} disabled={!profilePublicData?.header.userImage} />
        </View>
      )}
    </View>
  );
};
