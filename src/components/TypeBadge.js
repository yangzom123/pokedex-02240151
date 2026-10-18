import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE_COLORS, FONTS, RADIUS, SPACING } from '../themes';

export default function TypeBadge({ type }) {
  return (
    <View style={[styles.badge, { backgroundColor: TYPE_COLORS[type] || '#888' }]}>
      <Text style={styles.text}>{type.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.pill, marginHorizontal: SPACING.xs },
  text: { color: '#FFFFFF', fontSize: FONTS.caption, fontWeight: FONTS.bold },
});
