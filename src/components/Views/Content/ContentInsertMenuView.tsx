import {ListSection} from '../../Lists/ListSection';
import {List} from 'react-native-paper';
import {View} from 'react-native';
import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {useFormikContext} from 'formik';
import {PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {useSnackbar} from '../../Context/Contexts/SnackbarContext.ts';

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
    const permissionStatus = await requestPermission(PERMISSIONS.ANDROID.CAMERA);
    console.log('[ContentInsertMenuView.tsx] Camera permission is', permissionStatus);
    try {
      const image = await ImagePicker.openCamera({
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

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
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

  const processImage = (image: Image) => {
    if (image.data) {
      setFieldValue(fieldName, values.images.concat([{image: image.data}]));
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
