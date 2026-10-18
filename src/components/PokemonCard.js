import React from 'react';
import { Text, Image, Pressable, StyleSheet } from 'react-native';
import { getPokemonArtwork } from '../api';
import { COLORS, FONTS, RADIUS, SPACING } from '../themes';

export default function PokemonCard({ pokemon, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${pokemon.name}, number ${pokemon.id}`}
    >
      <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
      <Image source={{ uri: getPokemonArtwork(pokemon.id) }} style={styles.image} resizeMode="contain" />
      <Text style={styles.name} numberOfLines={1}>
        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 7,
    padding: SPACING.md,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card + 2,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    elevation: 3,
  },
  pressed: { opacity: 0.75, backgroundColor: COLORS.pressed },
  number: { alignSelf: 'flex-start', color: COLORS.secondary, fontSize: FONTS.caption, fontWeight: FONTS.bold },
  image: { width: 110, height: 105, marginVertical: 5 },
  name: { color: COLORS.primary, fontSize: FONTS.cardTitle, fontWeight: FONTS.bold, textAlign: 'center' },
});
