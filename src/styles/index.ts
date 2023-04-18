import {StyleSheet} from 'react-native';

export const styleDefaults = {
  marginSize: 20,
  iconSize: 25,
  avatarSize: 36,
  avatarSizeSmall: 24, // 2/3rds.
  headerImageSize: 216,
};

export const commonStyles = StyleSheet.create({
  margin: {
    margin: styleDefaults.marginSize,
  },
  marginHorizontal: {
    marginHorizontal: styleDefaults.marginSize,
  },
  displayNone: {
    display: 'none',
  },
  displayFlex: {
    display: 'flex',
  },
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexStart: {
    alignSelf: 'flex-start',
  },
  flexEnd: {
    alignSelf: 'flex-end',
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
  marginLeft: {
    marginLeft: styleDefaults.marginSize,
  },
  marginRight: {
    marginRight: styleDefaults.marginSize,
  },
  marginVertical: {
    marginVertical: styleDefaults.marginSize,
  },
  marginVerticalSmall: {
    marginVertical: styleDefaults.marginSize / 2,
  },
  marginHorizontalSmall: {
    marginHorizontal: styleDefaults.marginSize / 2,
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
  paddingTop: {
    paddingTop: styleDefaults.marginSize,
  },
  paddingSmall: {
    padding: styleDefaults.marginSize / 2,
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
  marginRightSmall: {
    marginRight: styleDefaults.marginSize / 2,
  },
  marginTopSmall: {
    marginTop: styleDefaults.marginSize / 2,
  },
  marginBottomSmall: {
    marginBottom: styleDefaults.marginSize / 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  marginZero: {
    // margin: 0 not good enough.
    marginVertical: 0,
    marginHorizontal: 0,
  },
  paddingHorizontalZero: {
    paddingHorizontal: 0,
  },
  spacerWidth: {
    width: styleDefaults.avatarSizeSmall * 2 + styleDefaults.marginSize,
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  // https://github.com/facebook/react-native/issues/30034
  verticallyInverted: {
    scaleY: -1,
  },
  fullWidth: {
    width: '100%',
  },
  headerImage: {
    width: styleDefaults.headerImageSize,
    height: styleDefaults.headerImageSize,
  },
  backgroundTransparent: {
    backgroundColor: 'transparent',
  },
  positionAbsolute: {
    position: 'absolute',
  },
});
