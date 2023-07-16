import {ListSection} from '../../Lists/ListSection';
import {List} from 'react-native-paper';
import {View} from 'react-native';
import React, {Dispatch, SetStateAction} from 'react';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

interface ContentInsertMenuViewProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export const ContentInsertMenuView = ({visible, setVisible}: ContentInsertMenuViewProps) => {
  const {setErrorMessage} = useErrorHandler();

  const handleInsertEmoji = () => {
    setErrorMessage('This feature is not yet implemented.');
    setVisible(false);
  };

  return (
    <>
      {visible && (
        <View>
          <ListSection>
            <List.Item title={'Custom Emoji'} onPress={handleInsertEmoji} />
            <List.Item title={'Attach Photo'} onPress={handleInsertEmoji} />
          </ListSection>
        </View>
      )}
    </>
  );
};
