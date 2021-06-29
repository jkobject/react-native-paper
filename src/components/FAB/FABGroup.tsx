import * as React from 'react';
import {
  StyleProp,
  StyleSheet,
  Animated,
  SafeAreaView,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import color from 'color';
import FAB from './FAB';
import { withTheme } from '../../core/theming';
import { Theme } from '../../types';
import { IconSource } from '../Icon';
import Button from '../../../../../components/Button/GenericButton.js';
import { colors as commonColors } from '../../../../../lib/CommonStyles';

type Props = {
  /**
   * Action items to display in the form of a speed dial.
   * An action item should contain the following properties:
   * - `icon`: icon to display (required)
   * - `label`: optional label text
   * - `accessibilityLabel`: accessibility label for the action, uses label by default if specified
   * - `color`: custom icon color of the action item
   * - `style`: pass additional styles for the fab item, for example, `backgroundColor`
   * - `onPress`: callback that is called when `FAB` is pressed (required)
   */
  actions: Array<{
    // icon: IconSource;
    // label?: string;
    // color?: string;
    // accessibilityLabel?: string;
    // style?: StyleProp<ViewStyle>;
    // onPress: () => void;
    // testID?: string;
    svg?: Node;
    text?: string;
    onPress: () => void;
    isPrimary?: false;
    isLoading?: false;
    size?: "medium";
    textColor?: null;
    disabled?: false;
  }>;
  /**
   * Icon to display for the `FAB`.
   * You can toggle it based on whether the speed dial is open to display a different icon.
   */
  icon: IconSource;
  /**
   * Accessibility label for the FAB. This is read by the screen reader when the user taps the FAB.
   */
  accessibilityLabel?: string;
  /**
   * Custom color for the `FAB`.
   */
  color?: string;
  /**
   * Function to execute on pressing the `FAB`.
   */
  onPress?: () => void;
  /**
   * Whether the speed dial is open.
   */
  open: boolean;
  /**
   * Callback which is called on opening and closing the speed dial.
   * The open state needs to be updated when it's called, otherwise the change is dropped.
   */
  onStateChange: (state: { open: boolean }) => void;
  /**
   * Whether `FAB` is currently visible.
   */
  visible: boolean;
  /**
   * Style for the group. You can use it to pass additional styles if you need.
   * For example, you can set an additional padding if you have a tab bar at the bottom.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style for the FAB. It allows to pass the FAB button styles, such as backgroundColor.
   */
  fabStyle?: StyleProp<ViewStyle>;
  /**
   * @optional
   */
  theme: Theme;
  /**
   * Pass down testID from Group props to FAB.
   */
  testID?: string;
  /**
   * Pointer mouse event in
   */
  onMouseEnter?: Function;
  /**
   * Pointer mouse event leave
   */
  onMouseLeave?: Function;
};

type State = {
  backdrop: Animated.Value;
  animations: Animated.Value[];
};

/**
 * A component to display a stack of FABs with related actions in a speed dial.
 * To render the group above other components, you'll need to wrap it with the [`Portal`](portal.html) component.
 *
 * <div class="screenshots">
 *   <img src="screenshots/fab-group.png" />
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { FAB, Portal, Provider } from 'react-native-paper';
 *
 * export default class MyComponent extends React.Component {
 *   state = {
 *     open: false,
 *   };
 *
 *   _onStateChange = ({ open }) => this.setState({ open });
 *
 *   render() {
 *     const { open } = this.state;
 *
 *     return (
 *       <Provider>
 *          <Portal>
 *            <FAB.Group
 *              open={open}
 *              icon={open ? 'calendar-today' : 'plus'}
 *              actions={[
 *                { icon: 'plus', onPress: () => console.log('Pressed add') },
 *                { icon: 'star', label: 'Star', onPress: () => console.log('Pressed star')},
 *                { icon: 'email', label: 'Email', onPress: () => console.log('Pressed email') },
 *                { icon: 'bell', label: 'Remind', onPress: () => console.log('Pressed notifications') },
 *              ]}
 *              onStateChange={this._onStateChange}
 *              onPress={() => {
 *                if (open) {
 *                  // do something if the speed dial is open
 *                }
 *              }}
 *            />
 *          </Portal>
 *       </Provider>
 *     );
 *   }
 * }
 * ```
 */
class FABGroup extends React.Component<Props, State> {
  static displayName = 'FAB.Group';

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    return {
      animations: nextProps.actions.map(
        (_, i) =>
          prevState.animations[i] || new Animated.Value(nextProps.open ? 1 : 0)
      ),
    };
  }

  state: State = {
    backdrop: new Animated.Value(0),
    animations: [],
  };

  componentDidUpdate(prevProps: Props) {
    if (this.props.open === prevProps.open) {
      return;
    }

    const { scale } = this.props.theme.animation;
    if (this.props.open) {
      Animated.parallel([
        Animated.timing(this.state.backdrop, {
          toValue: 0.32,
          duration: 250 * scale,
          useNativeDriver: true,
        }),
        Animated.stagger(
          50 * scale,
          this.state.animations
            .map(animation =>
              Animated.timing(animation, {
                toValue: 1,
                duration: 150 * scale,
                useNativeDriver: true,
              })
            )
            .reverse()
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(this.state.backdrop, {
          toValue: 0,
          duration: 200 * scale,
          useNativeDriver: true,
        }),
        Animated.stagger(
          50 * scale,
          this.state.animations
            .map(animation =>
              Animated.timing(animation, {
                toValue: 0,
                duration: 150 * scale,
                useNativeDriver: true,
              })
            )
        )
      ]).start();
    }
  }

  private close = () => this.props.onStateChange({ open: false });

  private toggle = () => this.props.onStateChange({ open: !this.props.open });

  render() {
    const {
      actions,
      icon,
      open,
      onPress,
      accessibilityLabel,
      theme,
      style,
      fabStyle,
      visible,
      testID,
      onMouseEnter,
      onMouseLeave
    } = this.props;
    const { colors } = theme;

    const labelColor = theme.dark
      ? colors.text
      : color(colors.text)
        .fade(0.54)
        .rgb()
        .string();
    const backdropOpacity = this.state.backdrop;

    const opacities = this.state.animations;
    const scales = opacities.map(opacity =>
      open
        ? opacity.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        })
        : 1
    );

    return (
      <View pointerEvents="box-none" style={[styles.container, style]}>
        <TouchableWithoutFeedback onPress={this.close} style={{ zIndex: -1 }}>
          <Animated.View
            pointerEvents={open ? 'auto' : 'none'}
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
                backgroundColor: '#555555',
              },
            ]}
          />
        </TouchableWithoutFeedback>
        <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
          <View pointerEvents={open ? 'box-none' : 'none'} style={{ width: '100%', alignItems: 'center' }}>
            {actions.map((it, i) => (
              <View
                key={i} // eslint-disable-line react/no-array-index-key
                pointerEvents={open ? 'box-none' : 'none'}
                style={{ width: '100%', paddingHorizontal: 46 }}
              >
                <Animated.View
                  style={
                    [
                      {
                        transform: [{ scale: scales[i] }],
                        opacity: opacities[i],
                        width: '100%'
                      },
                    ] as StyleProp<ViewStyle>
                  }>
                  <Button
                    svg={it.svg}
                    text={it.text}
                    onPress={() => {
                      it.onPress()
                      this.close()
                    }}
                    isPrimary={it.isPrimary}
                    isLoading={it.isLoading}
                    size={it.size}
                    textStyle={{ color: it.textColor, fontFamily: 'Nunito-Bold' }}
                    style={{ marginVertical: 6 }}
                    disabled={it.disabled} />
                </Animated.View>
              </View>
            ))}
          </View>
          <FAB
            onPress={() => {
              onPress?.();
              this.toggle();
            }}
            icon={icon}
            color={color}
            accessibilityLabel={accessibilityLabel}
            accessibilityTraits="button"
            accessibilityComponentType="button"
            accessibilityRole="button"
            style={[styles.fab, fabStyle, { backgroundColor: commonColors.backgroundMainColor }]}
            visible={visible}
            testID={testID}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        </SafeAreaView>
      </View>
    );
  }
}

export default withTheme(FABGroup);

// @component-docs ignore-next-line
export { FABGroup };

const styles = StyleSheet.create({
  safeArea: {
    alignItems: 'center'
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  fab: {
    marginBottom: 38
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
});
