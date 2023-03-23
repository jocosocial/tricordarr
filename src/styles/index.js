import {StyleSheet} from 'react-native';

const styleDefaults = {
  marginSize: 20,
};

export const commonStyles = StyleSheet.create({
  margin: {
    margin: styleDefaults.marginSize,
  },
  flex: {
    flex: 1,
  },
  marginTop: {
    marginTop: styleDefaults.marginSize,
  },
  marginBottom: {
    marginBottom: styleDefaults.marginSize,
  },
  marginNotTop: {
    marginLeft: styleDefaults.marginSize,
    marginRight: styleDefaults.marginSize,
    marginBottom: styleDefaults.marginSize,
  },
  booleanSettingRowView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paddingSides: {
    paddingLeft: styleDefaults.marginSize,
    paddingRight: styleDefaults.marginSize,
  },
  marginSides: {
    marginLeft: styleDefaults.marginSize,
    marginRight: styleDefaults.marginSize,
  },
});
