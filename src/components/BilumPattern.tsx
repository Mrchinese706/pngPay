import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * BilumPattern — a geometric weave pattern inspired by traditional PNG bilum bags.
 * Used as a decorative background element on cards, headers and feature screens.
 * Rendered purely with View primitives — no SVG dependency needed.
 */

type Props = {
  /** Total width of the pattern area */
  width?: number;
  /** Total height of the pattern area */
  height?: number;
  /** Colour of the pattern lines — defaults to current theme accent at low opacity */
  color?: string;
  /** Size of each diamond cell */
  cellSize?: number;
  /** Opacity of the whole pattern */
  opacity?: number;
};

export function BilumPattern({
  width = 300,
  height = 120,
  color,
  cellSize = 18,
  opacity = 0.12,
}: Props) {
  const { theme } = useTheme();
  const patternColor = color ?? theme.colors.accent;

  // Build a grid of rotated diamond shapes that mimic bilum weave
  const cols = Math.ceil(width / cellSize) + 2;
  const rows = Math.ceil(height / cellSize) + 2;
  const diamonds: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = r % 2 === 0 ? 0 : cellSize / 2;
      const x = c * cellSize + offsetX - cellSize;
      const y = r * (cellSize * 0.6) - cellSize * 0.3;
      diamonds.push(
        <View
          key={`${r}-${c}`}
          style={[
            styles.diamond,
            {
              width: cellSize * 0.55,
              height: cellSize * 0.55,
              left: x,
              top: y,
              borderColor: patternColor,
              borderWidth: 1.2,
            },
          ]}
        />,
      );
    }
  }

  return (
    <View
      style={[
        styles.container,
        { width, height, opacity },
      ]}
      pointerEvents="none"
    >
      {diamonds}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'absolute',
  },
  diamond: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'transparent',
    borderRadius: 1,
  },
});
