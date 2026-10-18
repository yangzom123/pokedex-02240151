import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, ActivityIndicator, Pressable, StyleSheet,
} from 'react-native';
import { fetchPokemonDetails, normalizePokemon, getPokemonArtwork } from '../api';
import { useTeam } from '../context/TeamContext';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';
import { COLORS, FONTS, SPACING, RADIUS, APP } from '../themes';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;                       // id arrives via route params
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isInTeam, isFull, addToTeam, removeFromTeam } = useTeam();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPokemon(normalizePokemon(await fetchPokemonDetails(id)));
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (pokemon) navigation.setOptions({ title: cap(pokemon.name) });
  }, [pokemon, navigation]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retry} onPress={load}><Text style={styles.retryText}>Retry</Text></Pressable>
      </View>
    );
  }

  const inTeam = isInTeam(pokemon.id);
  const blocked = !inTeam && isFull;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Image source={{ uri: getPokemonArtwork(pokemon.id) }} style={styles.image} resizeMode="contain" />
        <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
        <Text style={styles.name}>{cap(pokemon.name)}</Text>
        <View style={styles.types}>{pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}</View>
        <View style={styles.meta}>
          <View style={styles.metaBox}><Text style={styles.metaValue}>{pokemon.height} m</Text><Text style={styles.metaLabel}>Height</Text></View>
          <View style={styles.metaBox}><Text style={styles.metaValue}>{pokemon.weight} kg</Text><Text style={styles.metaLabel}>Weight</Text></View>
        </View>
      </View>

      <View style={[styles.card, { marginTop: SPACING.lg }]}>
        <Text style={styles.heading}>Base stats</Text>
        {pokemon.stats.map((s) => <StatBar key={s.name} label={s.name} value={s.value} />)}
      </View>

      <Pressable
        disabled={blocked}
        onPress={() => (inTeam ? removeFromTeam(pokemon.id) : addToTeam(pokemon))}
        style={[styles.button, inTeam && { backgroundColor: COLORS.danger }, blocked && { backgroundColor: COLORS.disabled }]}
      >
        <Text style={styles.buttonText}>
          {inTeam ? 'Remove from team' : blocked ? `Team is full (${APP.teamMax}/${APP.teamMax})` : 'Add to team'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: SPACING.xxl },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, borderWidth: 2, borderColor: COLORS.secondary },
  image: { width: '100%', height: 220 },
  number: { textAlign: 'center', color: COLORS.secondary, fontWeight: FONTS.bold, marginTop: SPACING.sm },
  name: { textAlign: 'center', fontSize: FONTS.screenTitle, fontWeight: FONTS.bold, color: COLORS.primary },
  types: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.sm },
  meta: { flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.lg },
  metaBox: { alignItems: 'center' },
  metaValue: { fontSize: FONTS.sectionTitle, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  metaLabel: { color: COLORS.textMuted, fontSize: FONTS.caption },
  heading: { fontSize: FONTS.sectionTitle, fontWeight: FONTS.bold, color: COLORS.secondary, marginBottom: SPACING.sm },
  button: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.medium, alignItems: 'center', marginTop: SPACING.xxl },
  buttonText: { color: COLORS.textOnPrimary, fontWeight: FONTS.bold, fontSize: FONTS.cardTitle },
  errorText: { color: COLORS.danger, marginBottom: SPACING.lg, textAlign: 'center' },
  retry: { backgroundColor: COLORS.accent, paddingVertical: SPACING.md, paddingHorizontal: 30, borderRadius: RADIUS.medium },
  retryText: { color: COLORS.textOnAccent, fontWeight: FONTS.bold },
});
