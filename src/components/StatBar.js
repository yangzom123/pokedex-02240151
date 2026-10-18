import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../themes';

const MAX_STAT = 255; // highest possible base stat

export default function StatBar({ label, value }) {
  const pct = Math.min(value / MAX_STAT, 1) * 100;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{Math.round(value)}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xs },
  label: { width: 105, color: COLORS.textSecondary, fontSize: FONTS.subtitle, textTransform: 'capitalize' },
  value: { width: 34, color: COLORS.textPrimary, fontWeight: FONTS.bold },
  track: { flex: 1, height: 10, backgroundColor: COLORS.border, borderRadius: RADIUS.pill, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.pill },
});
