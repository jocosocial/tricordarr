import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Snackbar} from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

// Lifted right from the source.
// https://callstack.github.io/react-native-paper/docs/components/Snackbar
export const ErrorSnackbar = ({actionLabel = 'Close', message}) => {
  const [visible, setVisible] = useState(!!message);
  // const [msg, setMsg] = useState(message);
  // const [triggerVisible, setTriggerVisible] = useState(trigger);

  // useEffect(() => {
  //   if (message !== '' && message) {
  //     setVisible(true);
  //     // setTriggerVisible(true);
  //   }
  // }, [message, msg]);

  console.log('Yodas message is', message);
  // const onToggleSnackBar = () => setVisible(!visible);
  function onDismissSnackBar() {
    setVisible(false);
    // setMsg(undefined);
    // setz
    // setTriggerVisible(false);
  }

  return (
    <View style={styles.container}>
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: actionLabel,
        }}>
        {message}
      </Snackbar>
    </View>
  );
};
