import React from 'react';
import NavigationContext from './NavigationContext';
import { View } from 'react-native';

export default class SceneView extends React.PureComponent {
  render() {
    const { component: Component, navigation } = this.props;
    const {hasModal,headerComponent,handleBack,isIOS,statusBarSize,hideNavBar,noNavBar} = navigation.getScreenProps();
    const HeaderComponent= headerComponent;
    const accessibilityOption = hasModal
      ? 'no-hide-descendants'
      : 'yes';
    const headerHeight= (isIOS ? 45 : 41) + statusBarSize;
    const paddingTop = (hideNavBar || noNavBar) ? 0 : headerHeight;

    return (
      <NavigationContext.Provider value={navigation}>
      <HeaderComponent {...navigation.getScreenProps()} onNavigateBack={handleBack} accessibilityOption={accessibilityOption} navigation={navigation}/>
      <View style={{height:paddingTop,zIndex: -1 }}></View>
      <Component {...navigation.getScreenProps()} navigation={navigation} />
      </NavigationContext.Provider>
    );
  }
}
