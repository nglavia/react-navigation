'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _reactNative = require('react-native');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _CardStack = require('./CardStack');

var _CardStack2 = _interopRequireDefault(_CardStack);

var _CardStackStyleInterpolator = require('./CardStackStyleInterpolator');

var _CardStackStyleInterpolator2 = _interopRequireDefault(_CardStackStyleInterpolator);

var _Transitioner = require('../Transitioner');

var _Transitioner2 = _interopRequireDefault(_Transitioner);

var _TransitionConfigs = require('./TransitionConfigs');

var _TransitionConfigs2 = _interopRequireDefault(_TransitionConfigs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NativeAnimatedModule = _reactNative.NativeModules && _reactNative.NativeModules.NativeAnimatedModule;

var FLIP_FORWARD = 'FLIP_FORWARD';
var FLIP_BACKWARD = 'FLIP_BACKWARD';

var isFlipTransition = function isFlipTransition(route) {
  return !route.hasTransitionCompleted && (route.customTransition === FLIP_FORWARD || route.customTransition === FLIP_BACKWARD);
};

var CardStackTransitioner = function (_React$Component) {
  _inherits(CardStackTransitioner, _React$Component);

  function CardStackTransitioner() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, CardStackTransitioner);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CardStackTransitioner.__proto__ || Object.getPrototypeOf(CardStackTransitioner)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      isFlipFrom: false,
      isFlipTo: false
    }, _this._configureTransition = function (
    // props for the new screen
    transitionProps, prevTransitionProps) {
      var isModal = _this.props.mode === 'modal';
      // Copy the object so we can assign useNativeDriver below
      // (avoid Flow error, transitionSpec is of type NavigationTransitionSpec).
      var transitionSpec = _extends({}, _TransitionConfigs2.default.getTransitionConfig(_this.props.transitionConfig, transitionProps, prevTransitionProps, isModal).transitionSpec);
      if (!!NativeAnimatedModule &&
      // Native animation support also depends on the transforms used:
      _CardStackStyleInterpolator2.default.canUseNativeDriver()) {
        // TODO setting useNativeDriver to false as a workaround.
        // Problem: Page freezes/doesn't respond to touch events when animations
        // swap between Card and CardStack now that the container view of
        // CardStack is an Animated.View (so it can do the flip transition)
        // Example 1 - Login in as SSO clicking a portal tile, logout, try to interact with Login page
        // Example 2 - Go to forgot password and back from Login, try to interact with Login page
        // Every time I get 1 to work, 2 breaks, and vice versa. Setting this to false solves both

        // Internal undocumented prop
        transitionSpec.useNativeDriver = false;
      }
      return transitionSpec;
    }, _this._render = function (props) {
      var _this$props = _this.props,
          screenProps = _this$props.screenProps,
          headerMode = _this$props.headerMode,
          mode = _this$props.mode,
          router = _this$props.router,
          cardStyle = _this$props.cardStyle,
          transitionConfig = _this$props.transitionConfig;


      var currentScene = _lodash2.default.last(_this.props.navigation.state.routes);
      return React.createElement(_CardStack2.default, _extends({
        screenProps: screenProps,
        headerMode: headerMode,
        mode: mode,
        router: router,
        cardStyle: cardStyle,
        transitionConfig: transitionConfig
      }, props, {
        headerComponent: _this.props.headerComponent,
        routeActions: _this.props.routeActions,
        isIOS: _this.props.isIOS,
        isAndroid: _this.props.isAndroid,
        isMultiPaneEligible: _this.props.isMultiPaneEligible,
        statusBarSize: _this.props.statusBarSize,
        trackingActions: _this.props.trackingActions,
        hasModal: _this.props.hasModal,
        openDrawer: _this.props.openDrawer,
        handleBackAction: _this.props.handleBackAction,
        handleNavigate: _this.props.handleNavigate,
        modals: _this.props.modals,
        isFlipTransition: isFlipTransition(currentScene),
        isFlipFrom: _this.state.isFlipFrom,
        isFlipTo: _this.state.isFlipTo
      }));
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(CardStackTransitioner, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var routes = this.props.navigation.state.routes;
      var currentScene = _lodash2.default.last(routes);
      var previousScene = _lodash2.default.last(routes.slice(0, -1));
      var splitPaneToSplitPaneNav = this.props.isMultiPaneEligible && currentScene.leftSplitPaneComponent && previousScene.leftSplitPaneComponent;
      var animation = this._configureTransition;
      if (splitPaneToSplitPaneNav) {
        animation = function animation() {
          return {
            timing: _reactNative.Animated.timing,
            duration: 0
          };
        };
      }

      return React.createElement(_Transitioner2.default, {
        configureTransition: animation,
        navigation: this.props.navigation,
        render: this._render,
        onTransitionStart: this.props.onTransitionStart,
        onTransitionEnd: this.props.onTransitionEnd,
        onFlipStart: function onFlipStart() {
          _this2.setState({
            isFlipFrom: true,
            isFlipTo: false
          });
        },
        onFlipFromComplete: function onFlipFromComplete() {
          _this2.setState({
            isFlipFrom: false,
            isFlipTo: true
          });
        },
        onFlipToComplete: function onFlipToComplete() {
          _this2.setState({
            isFlipFrom: false,
            isFlipTo: false
          });
        },
        isFlipTransition: isFlipTransition(currentScene)
      });
    }
  }]);

  return CardStackTransitioner;
}(React.Component);

CardStackTransitioner.defaultProps = {
  mode: 'card'
};
exports.default = CardStackTransitioner;