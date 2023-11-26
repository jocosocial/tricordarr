import {ListSection} from '../../Lists/ListSection';
import {List} from 'react-native-paper';
import {View} from 'react-native';
import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {useFormikContext} from 'formik';
import {PostContentData} from '../../../libraries/Structs/ControllerStructs';

interface ContentInsertMenuViewProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  fieldName?: string;
  enablePhotos?: boolean;
}

export const ContentInsertMenuView = ({
  visible,
  setVisible,
  enablePhotos = true,
  fieldName = 'images',
}: ContentInsertMenuViewProps) => {
  const {setErrorMessage} = useErrorHandler();
  const {values, setFieldValue, isSubmitting} = useFormikContext<PostContentData>();

  const handleInsertEmoji = () => {
    setErrorMessage('This feature is not yet implemented.');
    setVisible(false);
  };

  useEffect(() => {
    if (isSubmitting) {
      setVisible(false);
    }
  }, [isSubmitting, setVisible]);

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
      setErrorMessage(err);
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
      setErrorMessage(err);
    }
  };

  const processImage = (image: Image) => {
    if (image.data) {
      setFieldValue(fieldName, [{image: image.data}]);
      setVisible(false);
    }
  };

  const removeImage = () => {
    setFieldValue(fieldName, []);
    setVisible(false);
  };

  return (
    <>
      {visible && (
        <View>
          <ListSection>
            <List.Item title={'Custom Emoji'} onPress={handleInsertEmoji} />
            {enablePhotos && (
              <>
                <List.Item title={'Take New Photo'} onPress={takeImage} />
                <List.Item title={'Attach Existing Photo'} onPress={pickImage} />
                {values.images.length > 0 && <List.Item title={'Remove Attachment'} onPress={removeImage} />}
              </>
            )}
          </ListSection>
        </View>
      )}
    </>
  );
};
