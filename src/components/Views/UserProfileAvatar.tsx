import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {ProfilePublicData, UserHeader} from '#src/Structs/ControllerStructs';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {StyleSheet, View} from 'react-native';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {useUserAvatarMutation, useUserImageDeleteMutation} from '#src/Queries/User/UserAvatarMutations';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';
import {APIImage} from '#src/Components/Images/APIImage';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {ImageButtons} from '#src/Components/Buttons/ImageButtons';
import {styleDefaults} from '#src/Styles';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useUsersProfileQuery} from '#src/Queries/Users/UsersQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {useQueryClient} from '@tanstack/react-query';

interface UserProfileAvatarProps {
  user: ProfilePublicData;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

export const UserProfileAvatar = ({user, setRefreshing}: UserProfileAvatarProps) => {
  const {commonStyles} = useStyles();
  const avatarDeleteMutation = useUserImageDeleteMutation();
  const avatarMutation = useUserAvatarMutation();
  const {setSnackbarPayload} = useSnackbar();
  const usersProfileQuery = useUsersProfileQuery(user.header.userID);
  const {data: profilePublicData} = useUserProfileQuery();
  const {getIsDisabled} = useFeature();
  const queryClient = useQueryClient();

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
        width: styleDefaults.imageSquareCropDimension,
        height: styleDefaults.imageSquareCropDimension,
        includeBase64: true,
        mediaType: 'photo',
      });
      processImage(image);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  };

  const takeImage = async () => {
    const permissionStatus = await requestPermission(PERMISSIONS.ANDROID.CAMERA);
    console.log('[UserProfileAvatar.tsx] Camera permission is', permissionStatus);
    try {
      const image = await ImagePicker.openCamera({
        cropping: true,
        width: styleDefaults.imageSquareCropDimension,
        height: styleDefaults.imageSquareCropDimension,
        includeBase64: true,
        mediaType: 'photo',
      });
      processImage(image);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  };

  const onSuccess = async () => {
    const invalidations = UserHeader.getCacheKeys(user.header).map(key => {
      return queryClient.invalidateQueries(key);
    });
    await Promise.all(invalidations);
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
    setRefreshing(avatarMutation.isLoading || usersProfileQuery.isRefetching);
  }, [avatarMutation.isLoading, setRefreshing, usersProfileQuery.isRefetching]);

  const isSelf = profilePublicData?.header.userID === user.header.userID;

  if (!usersProfileQuery.data) {
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
        <ImageButtons
          takeImage={takeImage}
          clearImage={clearImage}
          pickImage={pickImage}
          style={commonStyles.justifyCenter}
          disableDelete={!profilePublicData?.header.userImage}
        />
      )}
    </View>
  );
};
