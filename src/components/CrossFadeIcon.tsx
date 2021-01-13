import * as React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Icon, { isValidIcon, isEqualIcon, IconSource } from './Icon';

import { withTheme } from '../core/theming';
import { Theme } from '../types';

type Props = {
  /**
   * Icon to display for the `CrossFadeIcon`.
   */
  source: IconSource;
  /**
   * Color of the icon.
   */
  color: string;
  /**
   * Size of the icon.
   */
  size: number;
  /**
   * @optional
   */
  theme: Theme;
  isOpen: boolean;
};

type State = {
  currentIcon: IconSource;
  previousIcon: IconSource | null;
  fade: Animated.Value;
};

class CrossFadeIcon extends React.Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, nextState: State) {
    if (nextState.currentIcon === nextProps.source) {
      return null;
    }

    return {
      currentIcon: nextProps.source,
      previousIcon: nextState.currentIcon,
    };
  }

  state: State = {
    currentIcon: this.props.source,
    fade: new Animated.Value(0),
  };

  componentDidUpdate(_: Props, prevState: State) {
    const {
      theme: {
        animation: { scale },
      },
    } = this.props;
    Animated.timing(this.state.fade, {
      duration: scale * 200,
      toValue: this.props.isOpen?1:0,
      useNativeDriver: false,
    }).start();
  }

  render() {
    const { color, size } = this.props;
    const rotateNext = this.state.previousIcon
      ? this.state.fade.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        })
      : '0deg';

    return (
      <View
        style={[
          styles.content,
          {
            height: size,
            width: size,
          },
        ]}>
        <Animated.View
          style={[
            styles.icon,
            {
              transform: [{ rotate: rotateNext }],
            },
          ]}
        >
          <Icon source={this.state.currentIcon} size={size} color={color} />
        </Animated.View>
      </View>
    );
  }
}

export default withTheme(CrossFadeIcon);

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
