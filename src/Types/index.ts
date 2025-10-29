// https://www.reddit.com/r/typescript/comments/vdk8we/is_there_a_type_for_objects_with_arbitrary_keys/
import {
  Animated,
  ColorValue,
  GestureResponderEvent,
  ImageSourcePropType,
  ImageURISource,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Button from 'react-native-paper/lib/typescript/components/Button/Button';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import type {$RemoveChildren} from 'react-native-paper/lib/typescript/types';

import {EventType} from '#src/Enums/EventType';
import {FezType} from '#src/Enums/FezType';

export type StringOrError = string | Error | undefined;

// Taken from the WebSocket class.
export type WebSocketOptions = {
  headers: {[headerName: string]: string};
  [optionName: string]: any;
} | null;

export type KeywordAction = 'add' | 'remove';

export type KeywordType = 'alertwords' | 'mutewords';

export type CruiseDayData = {
  date: Date;
  cruiseDay: number;
};

export type CruiseDayTime = {
  dayMinutes: number;
  cruiseDay: number;
};

export type ScheduleFilterSettings = {
  eventTypeFilter?: keyof typeof EventType;
  eventFavoriteFilter?: boolean;
  lfgTypeFilter?: keyof typeof FezType;
  showJoinedLfgs?: boolean;
  showOpenLfgs?: boolean;
  eventPersonalFilter?: boolean;
  eventLfgFilter?: boolean;
};

export type ScheduleCardMarkerType = 'now' | 'soon' | undefined;

/**
 * @deprecated Use APIImageV2Data instead.
 */
export interface ImageQueryData {
  base64?: string;
  mimeType: string;
  dataURI: string;
  fileName: string;
}

/**
 * @deprecated Use APIImageV2Data instead.
 */
export namespace ImageQueryData {
  export const fromData = (data: string): ImageQueryData => {
    return {
      mimeType: 'image',
      dataURI: `data:image;base64,${data}`,
      // @TODO how do I guarantee this to be a JPG?
      fileName: `tricordarr-${new Date().getTime()}.jpg`,
      base64: data,
    };
  };

  export const toImageSource = (queryData: ImageQueryData): ImageSourcePropType => {
    return {uri: queryData.dataURI};
  };

  export const toImageURISource = (queryData: ImageQueryData): ImageURISource => {
    return {uri: queryData.dataURI};
  };
}

export interface SegmentedButtonType {
  value: string;
  icon?: IconSource;
  disabled?: boolean;
  accessibilityLabel?: string;
  checkedColor?: string;
  uncheckedColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
  label?: string;
  showSelectedCheck?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

// This came from the upstream.
export interface FabGroupActionType {
  icon: IconSource;
  label?: string;
  color?: string;
  labelTextColor?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  containerStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  labelStyle?: StyleProp<TextStyle>;
  labelMaxFontSizeMultiplier?: number;
  onPress: (e: GestureResponderEvent) => void;
  size?: 'small' | 'medium';
  testID?: string;
  rippleColor?: ColorValue;
}

export interface StartEndTime {
  startTime: Date;
  endTime: Date;
}

export type FloatingScrollButtonVerticalPosition = 'raised' | 'bottom' | undefined;

export type FloatingScrollButtonHorizontalPosition = 'left' | 'right' | undefined;

export interface FlatListSeparatorProps<TItem> {
  highlighted: boolean;
  leadingItem: TItem;
}

export type ScheduleFlatListSeparator = 'day' | 'time' | 'none';

export type FezListEndpoints = 'open' | 'joined' | 'owner' | 'former';

export interface WithFezID {
  fezID: string;
}

export interface SnackbarPayload {
  action?: $RemoveChildren<typeof Button> & {
    label: string;
  };
  duration?: number;
  message?: string;
  messageType?: 'info' | 'error' | 'success';
  style?: StyleProp<ViewStyle>;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | Animated.Value;
}

// This is fucking stupid
export interface ParamsWithOobe {
  oobe?: boolean;
}

// This comes from 'react-native/Libraries/Components/TextInput/TextInput'.
// React Native deep imports are deprecated.
export type RNInputModeOptions = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

export type RNFlatListSeparatorComponent<TItem> = React.ComponentType<{leadingItem: TItem}> | undefined;
