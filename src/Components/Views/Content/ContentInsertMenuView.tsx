import {useFormikContext} from 'formik';
import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {View} from 'react-native';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {List} from 'react-native-paper';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';

import {ListSection} from '#src/Components/Lists/ListSection';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {PostContentData} from '#src/Structs/ControllerStructs';

interface ContentInsertMenuViewProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  fieldName?: string;
  enablePhotos?: boolean;
  setEmojiVisible: Dispatch<SetStateAction<boolean>>;
  maxPhotos: number;
}

export const ContentInsertMenuView = ({
  visible,
  setVisible,
  setEmojiVisible,
  enablePhotos = true,
  fieldName = 'images',
  maxPhotos,
}: ContentInsertMenuViewProps) => {
  const {setSnackbarPayload} = useSnackbar();
  const {values, setFieldValue, isSubmitting} = useFormikContext<PostContentData>();
  const currentPhotoCount = values.images.length;

  const handleInsertEmoji = () => {
    setVisible(false);
    setEmojiVisible(true);
  };

  useEffect(() => {
    if (isSubmitting) {
      setVisible(false);
      setEmojiVisible(false);
    }
  }, [isSubmitting, setEmojiVisible, setVisible]);

  const takeImage = async () => {
    const cameraPermission = isIOS ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const permissionStatus = await requestPermission(cameraPermission);
    console.log('[ContentInsertMenuView.tsx] Camera permission is', permissionStatus);
    try {
      const image = await ImagePicker.openCamera({
        includeBase64: true,
        mediaType: 'photo',
      });
      processImage(image, true);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  };

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        includeBase64: true,
        mediaType: 'photo',
      });
      processImage(image, false);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  };

  const processImage = (image: Image, fromCamera: boolean = false) => {
    if (image.data) {
      setFieldValue(fieldName, values.images.concat([{image: image.data, _shouldSaveToRoll: fromCamera}]));
      setVisible(false);
    }
  };

  return (
    <>
      {visible && (
        <View>
          <ListSection>
            <List.Item title={'Custom Emoji'} onPress={handleInsertEmoji} />
            {enablePhotos && (
              <>
                <List.Item
                  disabled={currentPhotoCount >= maxPhotos}
                  title={`Take a New Photo (Max: ${maxPhotos})`}
                  onPress={takeImage}
                />
                <List.Item
                  disabled={currentPhotoCount >= maxPhotos}
                  title={`Attach Existing Photo (Max: ${maxPhotos})`}
                  onPress={pickImage}
                />
              </>
            )}
          </ListSection>
        </View>
      )}
    </>
  );
};
