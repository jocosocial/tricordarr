import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {CommonActions} from '@react-navigation/native';
import {BottomNavigation} from 'react-native-paper';
import Animated from 'react-native-reanimated';

import {useLayout} from '#src/Context/Contexts/LayoutContext';

/**
 * Holy fuck what a regression this was.
 * https://callstack.github.io/react-native-paper/docs/components/BottomNavigation/BottomNavigationBar
 * https://reactnavigation.org/docs/6.x/material-bottom-tab-navigator/
 *
 * I suspect the React Navigation people were like "we're done with this crap" and made the Material
 * styling Paper's problem.
 */
export const AppBottomTabBar = (props: BottomTabBarProps) => {
  const {footerHeight} = useLayout();
  return (
    <Animated.View
      onLayout={e => {
        console.log('[AppBottomTabBar.tsx] onLayout found height', e.nativeEvent.layout.height);
        footerHeight.set(e.nativeEvent.layout.height);
      }}>
      <BottomNavigation.Bar
        navigationState={props.state}
        safeAreaInsets={props.insets}
        onTabPress={({route, preventDefault}) => {
          const event = props.navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (event.defaultPrevented) {
            preventDefault();
          } else {
            props.navigation.dispatch({
              ...CommonActions.navigate(route.name, route.params),
              target: props.state.key,
            });
          }
        }}
        renderIcon={({route, focused, color}) =>
          props.descriptors[route.key].options.tabBarIcon?.({
            focused,
            color,
            size: 24,
          }) || null
        }
        getLabelText={({route}) => {
          const {options} = props.descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          return label;
        }}
      />
    </Animated.View>
  );
};
