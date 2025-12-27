import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {CommonActions} from '@react-navigation/native';
import {View} from 'react-native';
import {BottomNavigation} from 'react-native-paper';

import {useLayout} from '#src/Context/Contexts/LayoutContext';

/**
 * Holy fuck what a regression this was.
 * https://callstack.github.io/react-native-paper/docs/components/BottomNavigation/BottomNavigationBar
 * https://reactnavigation.org/docs/6.x/material-bottom-tab-navigator/
 *
 * I suspect the React Navigation people were like "we're done with this crap" and made the Material
 * styling Paper's problem.
 *
 * The inconsistent pill animation is a known bug:
 * https://github.com/callstack/react-native-paper/issues/4767
 * I tried applying the code in https://github.com/callstack/react-native-paper/pull/4820
 * but it had unintended side effects on the styling of the tab buttons. So I am going to
 * leave it for now until it gets merged or sorted out.
 * https://github.com/jocosocial/tricordarr/issues/366
 */
export const AppBottomTabBar = (props: BottomTabBarProps) => {
  const {footerHeight} = useLayout();

  return (
    <View
      collapsable={false}
      onLayout={e => {
        const height = e.nativeEvent.layout.height;
        console.log('[AppBottomTabBar.tsx] onLayout found height', height);
        footerHeight.set(height);
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
        getBadge={({route}) => {
          const {options} = props.descriptors[route.key];
          return options.tabBarBadge;
        }}
      />
    </View>
  );
};
