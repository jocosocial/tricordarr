import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import {Text, View} from 'react-native';
import {defaultRenderVisibleButton, HeaderButton, HeaderButtonsComponentType} from 'react-navigation-header-buttons';

import {useAppTheme} from '#src/Styles/Theme';

/**
 * Button for navigation headers. Based on
 * https://github.com/vonovak/react-navigation-header-buttons/blob/master/example/src/components/MaterialHeaderButton.tsx
 */
export const MaterialHeaderButton: HeaderButtonsComponentType = props => {
  const theme = useAppTheme();

  // the `props` here come from <Item ... />
  // you may access them and pass something else to `HeaderButton` if you like
  return (
    <HeaderButton
      // the usual way to render:
      // IconComponent={MaterialCommunityIcons}
      // iconSize={23}
      // you can customize the colors, by default colors from React navigation theme will be used
      // pressColor="blue"
      {...props}
      color={props.color || theme.colors.onBackground}
      // alternative way to customize what is rendered:
      renderButton={itemProps => {
        // access anything that was defined on <Item ... />
        const {color, iconName, title} = itemProps;
        // showTitle is a custom prop, access it via type assertion
        const showTitle = (itemProps as any).showTitle;

        // On iOS, if both icon and title are provided and showTitle is enabled, render both (e.g., for back button)
        if (showTitle) {
          return (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <MaterialCommunityIcons name={iconName as any} color={color} size={23} />
              <Text style={{color, fontSize: 17, marginLeft: 4}}>{title}</Text>
            </View>
          );
        }

        return iconName ? (
          <MaterialCommunityIcons name={iconName as any} color={color} size={23} />
        ) : (
          // will render text with default styles
          defaultRenderVisibleButton(itemProps)
        );
      }}
    />
  );
};
