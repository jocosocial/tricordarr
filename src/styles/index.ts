import {StyleSheet} from 'react-native';

export const styleDefaults = {
  marginSize: 20,
  iconSize: 25,
  avatarSize: 36,
};

export const commonStyles = StyleSheet.create({
  margin: {
    margin: styleDefaults.marginSize,
  },
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
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
  verticalCenterContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  marginLeftSmall: {
    marginLeft: styleDefaults.marginSize / 2,
  },
  bold: {
    fontWeight: 'bold',
  },
});
