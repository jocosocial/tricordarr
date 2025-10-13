import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import {defaultRenderVisibleButton, HeaderButton, HeaderButtonsComponentType} from 'react-navigation-header-buttons';

/**
 * Button for navigation headers. Based on
 * https://github.com/vonovak/react-navigation-header-buttons/blob/master/example/src/components/MaterialHeaderButton.tsx
 */
export const MaterialHeaderButton: HeaderButtonsComponentType = props => {
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
      // alternative way to customize what is rendered:
      renderButton={itemProps => {
        // access anything that was defined on <Item ... />
        const {color, iconName} = itemProps;

        return iconName ? (
          <MaterialCommunityIcons name={iconName} color={color} size={23} />
        ) : (
          // will render text with default styles
          defaultRenderVisibleButton(itemProps)
        );
      }}
    />
  );
};
