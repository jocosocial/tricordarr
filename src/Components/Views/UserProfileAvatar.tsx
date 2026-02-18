import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';

import {ImageButtons} from '#src/Components/Buttons/ImageButtons';
import {APIImage} from '#src/Components/Images/APIImage';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {SetRefreshing} from '#src/Hooks/useRefresh';
import {createLogger} from '#src/Libraries/Logger';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {useUserAvatarMutation, useUserImageDeleteMutation} from '#src/Queries/User/UserAvatarMutations';
import {ProfilePublicData, UserHeader} from '#src/Structs/ControllerStructs';
import {styleDefaults} from '#src/Styles';

const logger = createLogger('UserProfileAvatar.tsx');

interface UserProfileAvatarProps {
  user: ProfilePublicData;
  setRefreshing: SetRefreshing;
}

const UserProfileAvatarImage = ({user}: {user: ProfilePublicData}) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    image: {
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.headerImage,
    },
  });

  if (!user.header.userImage) {
    logger.debug('Using identicon for user avatar');
    return <APIImage path={user.header.userID} mode={'image'} style={styles.image} staticSize={'identicon'} />;
  }
  return <APIImage path={user.header.userImage} mode={'image'} style={styles.image} />;

  // const imageData: APIImageV2Data = user.header.userImage
  //   ? APIImageV2Data.fromFileName(user.header.userImage, appConfig)
  //   : APIImageV2Data.fromIdenticon(user.header.userID, appConfig);

  // console.log('[UserProfileAvatarImage.tsx] imageData', imageData);
  // if (!imageData.fullURI && !imageData.identiconURI) {
  //   return <AppIcon icon={AppIcons.error} style={styles.image} />;
  // }

  // const imagePath = user.header.userImage ? imageData.fullURI : imageData.identiconURI;
  // console.log('[UserProfileAvatarImage.tsx] imagePath', imagePath);

  // return <APIImageV2 path={imagePath} mode={'image'} style={styles.image} />;
};

export const UserProfileAvatar = ({user, setRefreshing}: UserProfileAvatarProps) => {
  const {commonStyles} = useStyles();
  const avatarDeleteMutation = useUserImageDeleteMutation();
  const avatarMutation = useUserAvatarMutation();
  const {setSnackbarPayload} = useSnackbar();
  const {currentUserID} = useSession();
  const {getIsDisabled} = useFeature();
  const queryClient = useQueryClient();

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
    const cameraPermission = isIOS ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const permissionStatus = await requestPermission(cameraPermission);
    logger.debug('Camera permission is', permissionStatus);
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
      return queryClient.invalidateQueries({queryKey: key});
    });
    await Promise.all(invalidations);
  };

  const processImage = (image: Image) => {
    if (image.data) {
      setRefreshing(true);
      avatarMutation.mutate(
        {
          image: image.data,
        },
        {
          onSuccess: onSuccess,
          onSettled: () => setRefreshing(false),
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

  const isSelf = currentUserID === user.header.userID;

  return (
    <View>
      <UserProfileAvatarImage user={user} />
      {isSelf && !getIsDisabled(SwiftarrFeature.images) && (
        <ImageButtons
          takeImage={takeImage}
          clearImage={clearImage}
          pickImage={pickImage}
          style={commonStyles.justifyCenter}
          disableDelete={!user.header.userImage}
        />
      )}
    </View>
  );
};
