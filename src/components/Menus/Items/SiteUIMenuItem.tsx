import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';
import {Menu} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface SiteUIMenuItemProps {
  navigation: NativeStackNavigationProp<CommonStackParamList>;
  resource: string;
  title: string;
  icon?: IconSource;
  closeMenu?: () => void;
}
export const SiteUIMenuItem = (props: SiteUIMenuItemProps) => {
  const onPress = () => {
    props.navigation.push(CommonStackComponents.siteUIScreen, {
      resource: props.resource,
    });
    if (props.closeMenu) {
      props.closeMenu();
    }
  }
  return (
    <Menu.Item title={props.title} leadingIcon={props.icon || AppIcons.webview} onPress={onPress} />
  );
}
