import * as React from 'react';
import _ from 'lodash';

import { Animated, StyleSheet } from 'react-native';

import createPointerEventsContainer from './PointerEventsContainer';

/**
 * Component that renders the scene as card for the <NavigationCardStack />.
 */
class Card extends React.Component {
  render() {
    const { children, pointerEvents, style, scene } = this.props;
    const isTopScreen = scene.isActive;
    const modals = this.props.modals;
    const isAccessible = isTopScreen && (_.size(modals) === 0 || modals === undefined);
    return <Animated.View pointerEvents={pointerEvents} importantForAccessibility={isAccessible ? 'yes' : 'no-hide-descendants'} ref={this.props.onComponentRef} style={[styles.main, style]}>
        {children}
      </Animated.View>;
  }
}

const styles = StyleSheet.create({
  main: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    top: 0
  }
});

Card = createPointerEventsContainer(Card);

export default Card;