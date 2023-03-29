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
  paddingVertical: {
    paddingVertical: styleDefaults.marginSize,
  },
  paddingBottom: {
    paddingBottom: styleDefaults.marginSize,
  },
  marginHorizontal: {
    marginHorizontal: styleDefaults.marginSize,
  },
  verticalContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  marginLeftSmall: {
    marginLeft: styleDefaults.marginSize / 2,
  },
  marginTopSmall: {
    marginTop: styleDefaults.marginSize / 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  marginZero: {
    // margin: 0 not good enough.
    marginVertical: 0,
    marginHorizontal: 0,
  },
});
