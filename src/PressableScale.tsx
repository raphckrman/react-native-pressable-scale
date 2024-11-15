import React, { forwardRef, useCallback, useMemo } from 'react';
import { GestureResponderEvent, TouchableWithoutFeedbackProps, TouchableWithoutFeedback, View } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from 'react-native-reanimated';

// Wrap TouchableWithoutFeedback with forwardRef to allow refs
const TouchableWithoutFeedbackWithRef = forwardRef<TouchableWithoutFeedback, TouchableWithoutFeedbackProps>((props, ref) => {
	return <TouchableWithoutFeedback {...props} ref={ref as React.LegacyRef<TouchableWithoutFeedback>} />;
});

// Wrap TouchableWithoutFeedbackWithRef in Reanimated.createAnimatedComponent
const ReanimatedTouchableWithoutFeedback = Reanimated.createAnimatedComponent(TouchableWithoutFeedbackWithRef);

export interface PressableScaleProps extends TouchableWithoutFeedbackProps, Partial<Omit<WithSpringConfig, 'mass'>> {
	children: React.ReactNode;
	/**
	 * The value to scale to when the Pressable is being pressed.
	 * @default 0.95
	 */
	activeScale?: number;

	/**
	 * The weight physics of this button
	 * @default 'heavy'
	 */
	weight?: 'light' | 'medium' | 'heavy';
}

/**
 * A Pressable that scales down when pressed. Uses the JS Pressability API.
 */
export function PressableScale(props: PressableScaleProps): React.ReactElement {
	const {
		activeScale = 0.95,
		weight = 'heavy',
		damping = 15,
		stiffness = 150,
		overshootClamping = true,
		restSpeedThreshold = 0.001,
		restDisplacementThreshold = 0.001,
		style,
		onPressIn: _onPressIn,
		onPressOut: _onPressOut,
		delayPressIn = 0,
		children,
		...passThroughProps
	} = props;

	const mass = useMemo(() => {
		switch (weight) {
			case 'light':
				return 0.15;
			case 'medium':
				return 0.2;
			case 'heavy':
			default:
				return 0.3;
		}
	}, [weight]);

	const isPressedIn = useSharedValue(false);

	const springConfig = useMemo<WithSpringConfig>(
		() => ({
			damping,
			mass,
			stiffness,
			overshootClamping,
			restSpeedThreshold,
			restDisplacementThreshold,
		}),
		[damping, mass, overshootClamping, restDisplacementThreshold, restSpeedThreshold, stiffness],
	);

	const touchableStyle = useAnimatedStyle(() => ({
		transform: [{ scale: withSpring(isPressedIn.value ? activeScale : 1, springConfig) }],
	}), [activeScale, isPressedIn, springConfig]);

	const onPressIn = useCallback(
		(event: GestureResponderEvent) => {
			isPressedIn.value = true;
			_onPressIn?.(event);
		},
		[_onPressIn, isPressedIn],
	);

	const onPressOut = useCallback(
		(event: GestureResponderEvent) => {
			isPressedIn.value = false;
			_onPressOut?.(event);
		},
		[_onPressOut, isPressedIn],
	);

	return (
		<ReanimatedTouchableWithoutFeedback
			{...passThroughProps}
			delayPressIn={delayPressIn}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			style={touchableStyle}
		>
			<View style={style}>{children}</View>
		</ReanimatedTouchableWithoutFeedback>
	);
}
