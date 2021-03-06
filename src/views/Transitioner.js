/* @flow */

import * as React from 'react';
import _ from 'lodash';

import { Animated, Easing, StyleSheet, View } from 'react-native';

import invariant from '../utils/invariant';

import NavigationScenesReducer from './ScenesReducer';

import type {
  NavigationLayout,
  NavigationScene,
  NavigationState,
  NavigationScreenProp,
  NavigationTransitionProps,
  NavigationTransitionSpec,
} from '../TypeDefinition';

type Props = {
  configureTransition: (
    transitionProps: NavigationTransitionProps,
    prevTransitionProps: ?NavigationTransitionProps
  ) => NavigationTransitionSpec,
  navigation: NavigationScreenProp<NavigationState>,
  onTransitionEnd?: (...args: Array<mixed>) => void,
  onTransitionStart?: (...args: Array<mixed>) => void,
  render: (
    transitionProps: NavigationTransitionProps,
    prevTransitionProps: ?NavigationTransitionProps
  ) => React.Node,
  onFlipStart: Function,
  onFlipFromComplete: Function,
  onFlipToComplete: Function,
};

type State = {
  layout: NavigationLayout,
  position: Animated.Value,
  progress: Animated.Value,
  scenes: Array<NavigationScene>,
};

// Used for all animations unless overriden
const DefaultTransitionSpec = ({
  duration: 250,
  easing: Easing.inOut(Easing.ease),
  timing: Animated.timing,
}: NavigationTransitionSpec);

class Transitioner extends React.Component<Props, State> {
  _onLayout: (event: any) => void;
  _onTransitionEnd: () => void;
  _prevTransitionProps: ?NavigationTransitionProps;
  _transitionProps: NavigationTransitionProps;
  _isMounted: boolean;
  _isTransitionRunning: boolean;
  _queuedTransition: ?{
    nextProps: Props,
    nextScenes: Array<NavigationScene>,
    indexHasChanged: boolean,
  };

  constructor(props: Props, context: any) {
    super(props, context);

    // The initial layout isn't measured. Measured layout will be only available
    // when the component is mounted.
    const layout = {
      height: new Animated.Value(0),
      initHeight: 0,
      initWidth: 0,
      isMeasured: false,
      width: new Animated.Value(0),
    };

    this.state = {
      layout,
      position: new Animated.Value(this.props.navigation.state.index),
      progress: new Animated.Value(1),
      scenes: NavigationScenesReducer([], this.props.navigation.state),
    };

    this._prevTransitionProps = null;
    this._transitionProps = buildTransitionProps(props, this.state);
    this._isMounted = false;
    this._isTransitionRunning = false;
    this._queuedTransition = null;
  }

  componentWillMount(): void {
    this._onLayout = this._onLayout.bind(this);
    this._onTransitionEnd = this._onTransitionEnd.bind(this);
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps: Props): void {
    const nextScenes = NavigationScenesReducer(
      this.state.scenes,
      nextProps.navigation.state,
      this.props.navigation.state
    );

    if (nextScenes === this.state.scenes) {
      return;
    }

    const indexHasChanged =
      nextProps.navigation.state.index !== this.props.navigation.state.index;
    if (this._isTransitionRunning) {
      this._queuedTransition = { nextProps, nextScenes, indexHasChanged };
      return;
    }

    this._startTransition(nextProps, nextScenes, indexHasChanged);
  }

  _startTransition(
    nextProps: Props,
    nextScenes: Array<NavigationScene>,
    indexHasChanged: boolean
  ) {
    const nextState = {
      ...this.state,
      scenes: nextScenes,
    };

    const { position, progress } = nextState;

    progress.setValue(0);

    this._prevTransitionProps = this._transitionProps;
    this._transitionProps = buildTransitionProps(nextProps, nextState);

    // get the transition spec.
    const transitionUserSpec = nextProps.configureTransition
      ? nextProps.configureTransition(
          this._transitionProps,
          this._prevTransitionProps
        )
      : null;

    const transitionSpec = {
      ...DefaultTransitionSpec,
      ...transitionUserSpec,
    };

    const { timing } = transitionSpec;
    delete transitionSpec.timing;

    const toValue = nextProps.navigation.state.index;
    const positionHasChanged = position.__getValue() !== toValue;

    // update scenes and play the transition
    this._isTransitionRunning = true;
    this.setState(nextState, async () => {
      if (nextProps.onTransitionStart) {
        const result = nextProps.onTransitionStart(
          this._transitionProps,
          this._prevTransitionProps
        );

        if (result instanceof Promise) {
          await result;
        }
      }
      if (this.props.isFlipTransition) {
        const { flipFromAnimation, flipToAnimation } = getFlipAnimations(
          indexHasChanged,
          positionHasChanged,
          progress,
          position,
          nextProps,
          transitionSpec
        );
        this.props.onFlipStart();
        Animated.parallel(flipFromAnimation).start(callback => {
          // Split into two animations solely so we can get this callback half
          // way through.  We use it so that during first half of flip, we don't
          // draw the topmost screen, but after the halfway point we render it
          // as normal.  In this way it looks like it appears after the halfway
          // point of the flip
          this.props.onFlipFromComplete();
          Animated.parallel(flipToAnimation).start(callback => {
            this.props.onFlipToComplete();
            this._onTransitionEnd();
          });
        });
      } else {
        // if swiped back, indexHasChanged == true && positionHasChanged == false
        const animations = getRegularAnimation(
          indexHasChanged,
          positionHasChanged,
          progress,
          position,
          nextProps,
          transitionSpec,
          timing
        );

        Animated.parallel(animations).start(this._onTransitionEnd);
      }
    });
  }

  render() {
    return (
      <View onLayout={this._onLayout} style={[styles.main]}>
        {this.props.render(this._transitionProps, this._prevTransitionProps)}
      </View>
    );
  }

  _onLayout(event: any): void {
    const { height, width } = event.nativeEvent.layout;
    if (
      this.state.layout.initWidth === width &&
      this.state.layout.initHeight === height
    ) {
      return;
    }
    const layout = {
      ...this.state.layout,
      initHeight: height,
      initWidth: width,
      isMeasured: true,
    };

    layout.height.setValue(height);
    layout.width.setValue(width);

    const nextState = {
      ...this.state,
      layout,
    };

    this._transitionProps = buildTransitionProps(this.props, nextState);
    this.setState(nextState);
  }

  _onTransitionEnd(): void {
    if (!this._isMounted) {
      return;
    }
    const prevTransitionProps = this._prevTransitionProps;
    this._prevTransitionProps = null;

    const nextState = {
      ...this.state,
      scenes: this.state.scenes.filter(isSceneNotStale),
    };

    this._transitionProps = buildTransitionProps(this.props, nextState);

    this.setState(nextState, async () => {
      if (this.props.onTransitionEnd) {
        const result = this.props.onTransitionEnd(
          this._transitionProps,
          prevTransitionProps
        );

        if (result instanceof Promise) {
          await result;
        }
      }

      if (this._queuedTransition) {
        this._startTransition(
          this._queuedTransition.nextProps,
          this._queuedTransition.nextScenes,
          this._queuedTransition.indexHasChanged
        );
        this._queuedTransition = null;
      } else {
        this._isTransitionRunning = false;
      }
    });
  }
}

function buildTransitionProps(
  props: Props,
  state: State
): NavigationTransitionProps {
  const { navigation } = props;

  const { layout, position, progress, scenes } = state;

  const scene = scenes.find(isSceneActive);

  invariant(scene, 'Could not find active scene');

  return {
    layout,
    navigation,
    position,
    progress,
    scenes,
    scene,
    index: scene.index,
  };
}

function isSceneNotStale(scene: NavigationScene): boolean {
  return !scene.isStale;
}

function isSceneActive(scene: NavigationScene): boolean {
  return scene.isActive;
}

function getRegularAnimation(
  indexHasChanged,
  positionHasChanged,
  progress,
  position,
  nextProps,
  transitionSpec,
  timing
) {
  return indexHasChanged && positionHasChanged
    ? [
        timing(progress, {
          ...transitionSpec,
          toValue: 1,
        }),
        timing(position, {
          ...transitionSpec,
          toValue: nextProps.navigation.state.index,
        }),
      ]
    : [];
}

function getFlipAnimations(
  indexHasChanged,
  positionHasChanged,
  progress,
  position,
  nextProps,
  transitionSpec
) {
  const flipFromAnimation =
    indexHasChanged && positionHasChanged
      ? [
          Animated.timing(progress, {
            ...transitionSpec,
            toValue: 0.5,
          }),
          Animated.timing(position, {
            ...transitionSpec,
            toValue: nextProps.navigation.state.index - 0.5,
          }),
        ]
      : [];
  const flipToAnimation =
    indexHasChanged && positionHasChanged
      ? [
          Animated.timing(progress, {
            ...transitionSpec,
            toValue: 1,
          }),
          Animated.timing(position, {
            ...transitionSpec,
            toValue: nextProps.navigation.state.index,
          }),
        ]
      : [];

  return {
    flipFromAnimation,
    flipToAnimation,
  };
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});

export default Transitioner;
