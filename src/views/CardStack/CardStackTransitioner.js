/* @flow */

import * as React from 'react';
import {
  Animated,
  NativeModules
} from 'react-native';

import CardStack from './CardStack';
import CardStackStyleInterpolator from './CardStackStyleInterpolator';
import Transitioner from '../Transitioner';
import TransitionConfigs from './TransitionConfigs';

import type {
  NavigationSceneRenderer,
  NavigationScreenProp,
  NavigationStackScreenOptions,
  NavigationState,
  NavigationTransitionProps,
  NavigationNavigatorProps,
  NavigationRouter,
  HeaderMode,
  ViewStyleProp,
  TransitionConfig,
} from '../../TypeDefinition';

const NativeAnimatedModule =
  NativeModules && NativeModules.NativeAnimatedModule;

type Props = {
  headerMode: HeaderMode,
  mode: 'card' | 'modal',
  router: NavigationRouter<NavigationState, NavigationStackScreenOptions>,
  cardStyle?: ViewStyleProp,
  onTransitionStart?: () => void,
  onTransitionEnd?: () => void,
  /**
   * Optional custom animation when transitioning between screens.
   */
  transitionConfig?: () => TransitionConfig,
} & NavigationNavigatorProps<NavigationStackScreenOptions, NavigationState>;

class CardStackTransitioner extends React.Component<Props> {
  _render: NavigationSceneRenderer;

  static defaultProps = {
    mode: 'card',
  };

  render() {
    const routes = this.props.navigation.state.routes;
    const currentScene = routes[routes.length - 1] || {};
    const previousScene = routes[routes.length - 2] || {};
    const splitPaneToSplitPaneNav = this.props.isMultiPaneEligible
      && currentScene.leftSplitPaneComponent && previousScene.leftSplitPaneComponent;
    let animation = this._configureTransition;
    if (splitPaneToSplitPaneNav) {
      animation = () => ({
        timing: Animated.timing,
        duration: 0,
      });
    }

    return (
      <Transitioner
        configureTransition={animation}
        navigation={this.props.navigation}
        render={this._render}
        onTransitionStart={this.props.onTransitionStart}
        onTransitionEnd={this.props.onTransitionEnd}
      />
    );
  }

  _configureTransition = (
    // props for the new screen
    transitionProps: NavigationTransitionProps,
    // props for the old screen
    prevTransitionProps: ?NavigationTransitionProps
  ) => {
    let customTransitionConfig = this.props.transitionConfig;
    if (this.props.transitionConfig !== null) {
      const screenInterpolator = this.props.transitionConfig && this.props.transitionConfig().screenInterpolator(transitionProps);
      // if the screen interpolator from this.props.transtionConfig is null then we want to set customTransitionConfig to null so the default will be used
      if (screenInterpolator === null) {
        customTransitionConfig = null;
      }
    }
    const isModal = this.props.mode === 'modal';
    // Copy the object so we can assign useNativeDriver below
    // (avoid Flow error, transitionSpec is of type NavigationTransitionSpec).
    const transitionSpec = {
      ...TransitionConfigs.getTransitionConfig(
        customTransitionConfig,
        transitionProps,
        prevTransitionProps,
        isModal
      ).transitionSpec,
    };
    if (
      !!NativeAnimatedModule &&
      // Native animation support also depends on the transforms used:
      CardStackStyleInterpolator.canUseNativeDriver()
    ) {
      // Internal undocumented prop
      transitionSpec.useNativeDriver = true;
    }
    return transitionSpec;
  };

  _render = (props: NavigationTransitionProps): React.Node => {
    const {
      screenProps,
      headerMode,
      mode,
      router,
      cardStyle,
      transitionConfig,
    } = this.props;
    return (
      <CardStack
        screenProps={screenProps}
        headerMode={headerMode}
        mode={mode}
        router={router}
        cardStyle={cardStyle}
        transitionConfig={transitionConfig}
        {...props}
        headerComponent={this.props.headerComponent}
        routeActions={this.props.routeActions}
        isIOS={this.props.isIOS}
        isAndroid={this.props.isAndroid}
        isMultiPaneEligible={this.props.isMultiPaneEligible}
        statusBarSize={this.props.statusBarSize}
        trackingActions={this.props.trackingActions}
        hasModal={this.props.hasModal}
        openDrawer={this.props.openDrawer}
        handleBackAction={this.props.handleBackAction}
        handleNavigate={this.props.handleNavigate}
        modals={this.props.modals}
      />
    );
  };
}

export default CardStackTransitioner;
