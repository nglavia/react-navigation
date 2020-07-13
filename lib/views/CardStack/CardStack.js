'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _clamp = require('clamp');

var _clamp2 = _interopRequireDefault(_clamp);

var _reactNative = require('react-native');

var _Card = require('./Card');

var _Card2 = _interopRequireDefault(_Card);

var _NavigationActions = require('../../NavigationActions');

var _NavigationActions2 = _interopRequireDefault(_NavigationActions);

var _addNavigationHelpers = require('../../addNavigationHelpers');

var _addNavigationHelpers2 = _interopRequireDefault(_addNavigationHelpers);

var _CardSceneView = require('../CardSceneView');

var _CardSceneView2 = _interopRequireDefault(_CardSceneView);

var _TransitionConfigs = require('./TransitionConfigs');

var _TransitionConfigs2 = _interopRequireDefault(_TransitionConfigs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var emptyFunction = function emptyFunction() {};

var theme = {
  white: '#FFFFFF',
  lightGrey: '#B7B7B7',
  primaryBlue: '#0074B4'
};

var CardStack = function (_React$Component) {
  _inherits(CardStack, _React$Component);

  function CardStack(props) {
    _classCallCheck(this, CardStack);

    var _this = _possibleConstructorReturn(this, (CardStack.__proto__ || Object.getPrototypeOf(CardStack)).call(this, props));

    _this._screenDetails = {};

    _this._getTransitionConfig = function (isAnimateFromBottom, isFlipTransition) {
      var isModal = _this.props.mode === 'modal';

      return _TransitionConfigs2.default.getTransitionConfig(_this.props.transitionConfig,
      /* $FlowFixMe */
      {},
      /* $FlowFixMe */
      {}, isModal || isAnimateFromBottom, isFlipTransition);
    };

    _this._renderCard = function (scene, _ref) {
      var isFlipTransition = _ref.isFlipTransition,
          shouldHide = _ref.shouldHide;
      var position = _this.props.position;


      var individualCardAnimation = null;
      if (isFlipTransition) {
        if (shouldHide) {
          // Hide topmost card for first half of flip transition
          individualCardAnimation = {
            opacity: 0
          };
        }
      } else {
        // Only apply BAU transitioning style as a non-flip
        // Quirky behavior seen when incorrectly applied where touchables don't respond
        var _this$_getTransitionC = _this._getTransitionConfig(scene.route.animateFromBottom),
            screenInterpolator = _this$_getTransitionC.screenInterpolator;

        individualCardAnimation = screenInterpolator && screenInterpolator(_extends({}, _this.props, { scene: scene }));
      }

      var SceneComponent = _this.props.router.getComponentForRouteName(scene.route.routeName);

      return React.createElement(
        _Card2.default,
        _extends({}, _this.props, {
          key: 'card_' + scene.key,
          style: [_this.props.cardStyle, individualCardAnimation],
          scene: scene
        }),
        _this._renderInnerScene(SceneComponent, scene)
      );
    };

    _this.state = {
      headerHeight: (props.isIOS ? 45 : 41) + props.statusBarSize
    };
    // (this: any)._trackState = this._trackState.bind(this);
    _this._hasSplitPaneComponent = _this._hasSplitPaneComponent.bind(_this);
    return _this;
  }

  _createClass(CardStack, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _this2 = this;

      if (nextProps.statusBarSize !== this.props.statusBarSize) {
        this.setState({
          headerHeight: (this.props.isIOS ? 45 : 41) + nextProps.statusBarSize
        });
      }

      nextProps.scenes.forEach(function (newScene) {
        if (_this2._screenDetails[newScene.key] && _this2._screenDetails[newScene.key].state !== newScene.route) {
          _this2._screenDetails[newScene.key] = null;
        }
      });
    }
  }, {
    key: '_hasSplitPaneComponent',
    value: function _hasSplitPaneComponent(scene) {
      return this.props.isMultiPaneEligible === true && scene.route.leftSplitPaneComponent != null;
    }
  }, {
    key: '_renderHeader',
    value: function _renderHeader(scene, headerMode) {
      // Caribou Start
      var accessibilityOption = this.props.hasModal ? 'no-hide-descendants' : 'yes';

      var config = this._getTransitionConfig();
      var transitionAnimation = null;
      if (config && config.screenInterpolator) {
        transitionAnimation = config.screenInterpolator(_extends({}, this.props, { scene: scene }));
      }

      return (
        // $FlowFixMeRN0.51.1
        React.createElement(this.props.headerComponent, _extends({}, this.props, {
          accessibilityOption: accessibilityOption,
          openDrawer: this.props.openDrawer,
          onNavigateBack: this.props.handleBackAction,
          scene: scene,
          mode: headerMode,
          transitionAnimation: transitionAnimation,
          isFlipTransition: this.props.isFlipTransition
        }))
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var floatingHeader = null;
      var headerMode = this._getHeaderMode();

      var _props = this.props,
          scene = _props.scene,
          scenes = _props.scenes,
          position = _props.position,
          isFlipTransition = _props.isFlipTransition,
          isFlipFrom = _props.isFlipFrom,
          isFlipTo = _props.isFlipTo;

      var _processFlipAnimation = processFlipAnimation(scene, scenes, isFlipTransition, isFlipFrom, isFlipTo),
          topVisibleScene = _processFlipAnimation.topVisibleScene,
          isHideTopScene = _processFlipAnimation.isHideTopScene,
          nonPurgedScenes = _processFlipAnimation.nonPurgedScenes;

      if (headerMode === 'float') {
        floatingHeader = this._renderHeader(topVisibleScene, headerMode);
      }

      var containerStyle = [styles.container, this._getTransitionConfig().containerStyle];

      var _getTransitionConfig = this._getTransitionConfig(topVisibleScene.route.animateFromBottom),
          screenInterpolator = _getTransitionConfig.screenInterpolator;

      var flipAnimationStyle = {};
      if (isFlipTransition) {
        flipAnimationStyle = screenInterpolator && screenInterpolator(_extends({}, this.props));
      }

      return React.createElement(
        _reactNative.Animated.View,
        { style: [containerStyle, flipAnimationStyle] },
        React.createElement(
          _reactNative.View,
          { style: styles.scenes },
          nonPurgedScenes.map(function (s, idx) {
            var isTopScene = s.key === scene.key;
            var isTopVisibleScene = s.key === topVisibleScene.key;
            var shouldHideFlipToScene = isHideTopScene && isTopScene;
            var shouldHideFlipFromScene = !isHideTopScene && !isTopScene && isFlipTransition;
            var shouldHide = shouldHideFlipToScene || shouldHideFlipFromScene;
            return _this3._renderCard(s, {
              isFlipTransition: isFlipTransition,
              shouldHide: shouldHide
            });
          })
        ),
        floatingHeader
      );
    }
  }, {
    key: '_getHeaderMode',
    value: function _getHeaderMode() {
      if (this.props.headerMode) {
        return this.props.headerMode;
      }
      if (this.props.mode === 'modal') {
        return 'screen';
      }
      return 'float';
    }
  }, {
    key: '_renderInnerScene',
    value: function _renderInnerScene(SceneComponent, scene) {
      var route = scene.route;

      var SplitPaneComponent = route.leftSplitPaneComponent;
      var hasSplitPaneComponent = this._hasSplitPaneComponent(scene);

      var paddingTop = route.hideNavBar || route.noNavBar ? 0 : this.state.headerHeight;
      var isActiveRoute = scene.isActive && !this.props.hasModal;

      return React.createElement(
        _reactNative.View,
        {
          style: { flex: 1, backgroundColor: theme.white },
          testID: 'Screen_' + scene.route.routeName + '_' + (isActiveRoute ? 'IsActive' : 'IsNotActive')
        },
        React.createElement(_reactNative.View, {
          style: {
            height: paddingTop,
            backgroundColor: theme.primaryBlue
          }
        }),
        React.createElement(
          _reactNative.View,
          { style: { flexDirection: 'row', flex: 1 } },
          hasSplitPaneComponent && SplitPaneComponent && React.createElement(
            _reactNative.View,
            {
              style: {
                width: 300,
                borderRightWidth: 1,
                borderColor: theme.lightGrey,
                overflow: 'visible',
                zIndex: 1
              }
            },
            React.createElement(_CardSceneView2.default, {
              key: 'SPLIT_PANE' + route.key,
              routeProps: scene.route,
              component: SplitPaneComponent,
              scene: scene,
              handleNavigate: this.props.handleNavigate,
              handleBack: this.props.handleBackAction,
              trackingActions: this.props.trackingActions,
              hasModal: this.props.hasModal,
              isLeftSplitPaneComponent: true
            })
          ),
          React.createElement(
            _reactNative.View,
            { style: { flex: 1 } },
            React.createElement(_CardSceneView2.default, _extends({}, route, {
              key: scene.key,
              routeKey: route.key,
              routeProps: scene.route,
              component: SceneComponent,
              scene: scene,
              handleNavigate: this.props.handleNavigate,
              handleBack: this.props.handleBackAction,
              trackingActions: this.props.trackingActions,
              hasModal: this.props.hasModal
            }))
          )
        )
      );
    }
  }]);

  return CardStack;
}(React.Component);

function processFlipAnimation(scene, scenes, isFlipTransition, isFlipFrom, isFlipTo) {
  var nonPurgedScenes = scenes;
  var topVisibleScene = _lodash2.default.last(scenes);

  var isHideTopScene = false;
  if (isFlipTransition) {
    if (isFlipFrom) {
      // If flip from animation in progress, the top visible scene is actually
      // the previous route
      topVisibleScene = _lodash2.default.last(nonPurgedScenes.slice(0, -1));
      isHideTopScene = true;
    }
  }

  nonPurgedScenes = nonPurgedScenes.filter(function (scene) {
    return !scene.route.isPurged;
  });

  return {
    topVisibleScene: topVisibleScene,
    isHideTopScene: isHideTopScene,
    nonPurgedScenes: nonPurgedScenes
  };
}

var styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    // Header is physically rendered after scenes so that Header won't be
    // covered by the shadows of the scenes.
    // That said, we'd have use `flexDirection: 'column-reverse'` to move
    // Header above the scenes.
    flexDirection: 'column-reverse'
  },
  scenes: {
    flex: 1
  }
});

exports.default = CardStack;