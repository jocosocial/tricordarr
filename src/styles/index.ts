import {StyleSheet} from 'react-native';

export const styleDefaults = {
  marginSize: 20,
  iconSize: 25,
  avatarSize: 36,
  avatarSizeSmall: 24, // 2/3rds.
  headerImageSize: 216,
  fontSize: 16, // This is copied from styles/Theme.
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
  flex0: {
    flex: 0,
  },
  flex: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  // https://stackoverflow.com/questions/45503294/space-between-components-in-react-native-styling
  gap: {
    gap: styleDefaults.marginSize,
  },
  gapSmall: {
    gap: styleDefaults.marginSize / 2,
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
  flexWrap: {
    flexWrap: 'wrap',
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
  marginRightBig: {
    marginRight: styleDefaults.marginSize * 1.5,
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
  justifyContentEnd: {
    justifyContent: 'flex-end',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  paddingLeftSmall: {
    paddingLeft: styleDefaults.marginSize / 2,
  },
  paddingHorizontal: {
    paddingLeft: styleDefaults.marginSize,
    paddingRight: styleDefaults.marginSize,
    paddingHorizontal: styleDefaults.marginSize,
  },
  paddingHorizontalSmall: {
    paddingLeft: styleDefaults.marginSize / 2,
    paddingRight: styleDefaults.marginSize / 2,
    paddingHorizontal: styleDefaults.marginSize / 2,
  },
  paddingVertical: {
    paddingVertical: styleDefaults.marginSize,
  },
  paddingVerticalSmall: {
    paddingVertical: styleDefaults.marginSize / 2,
  },
  paddingBottom: {
    paddingBottom: styleDefaults.marginSize,
  },
  paddingBottomSmall: {
    paddingBottom: styleDefaults.marginSize / 2,
  },
  paddingBottomZero: {
    paddingBottom: 0,
  },
  paddingTop: {
    paddingTop: styleDefaults.marginSize,
  },
  paddingTopSmall: {
    paddingTop: styleDefaults.marginSize / 2,
  },
  paddingSmall: {
    padding: styleDefaults.marginSize / 2,
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
  paddingVerticalZero: {
    paddingVertical: 0,
  },
  paddingLeftZero: {
    paddingLeft: 0,
  },
  paddingRightZero: {
    paddingRight: 0,
  },
  spacerWidth: {
    width: styleDefaults.avatarSizeSmall * 2 + styleDefaults.marginSize,
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifySpaceBetween: {
    justifyContent: 'space-between',
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
  navigationHeaderTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    lineHeight: undefined,
  },
  italics: {
    fontStyle: 'italic',
  },
  borderBottomZero: {
    borderBottomWidth: 0,
  },
  emoji: {
    width: 20, //styleDefaults.fontSize * 1.5,
    height: 20, //styleDefaults.fontSize * 1.5,
  },
  textCenter: {
    textAlign: 'center',
  },
  flexGrow: {
    flexGrow: 1,
  },
  heightFull: {
    height: '100%',
  },
  cardBannerWidth: {
    minWidth: styleDefaults.marginSize * 2,
    width: styleDefaults.marginSize * 2,
  },
  fontSizeDefault: {
    fontSize: styleDefaults.fontSize,
  },
  fontSizeLabel: {
    fontSize: styleDefaults.fontSize * 0.75,
  },
  fontFamilyNormal: {
    fontFamily: 'sans-serif',
  },
});
